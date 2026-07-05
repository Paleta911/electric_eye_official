import cv2
import os
import numpy as np
from ultralytics import YOLO
from pymongo import MongoClient
from datetime import datetime, timedelta
import gridfs
import face_recognition
import threading
import queue
import pickle
import requests
import time
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ==============================================================================
# 🛠️ 1. CONFIGURACIÓN INICIAL DEL SISTEMA
# ==============================================================================

# --- CONFIGURACIÓN DE RUTAS Y ARCHIVOS (¡AJUSTAR ESTA RUTA!) ---
REFERENCE_DIRECTORY = os.getenv("REFERENCE_DIRECTORY", os.path.join(BASE_DIR, "fotos"))
PICKLE_FILE = os.getenv("PICKLE_FILE", os.path.join(BASE_DIR, "reference_encodings.pkl"))
MODELO_YOLO = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "entrenamiento.pt"))

# --- CONFIGURACIÓN DE RENDIMIENTO Y DISPLAY ---
# Umbral de confianza de detección YOLO. Bajar este valor (ej. 0.25) ayuda a detectar 
# objetos pequeños como "Cuchilla" y "Arma", pero puede aumentar los falsos positivos.
CONFIDENCE_THRESHOLD = 0.25 
# Dimensiones para la visualización 9:16 (vertical)
DISPLAY_WIDTH = 360
DISPLAY_HEIGHT = 640 

# --- CONFIGURACIÓN DE SERVICIOS Y API ---
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "video_database")
API_URL = os.getenv("API_URL", "http://localhost:3000/api/rostros")

# --- CONFIGURACIÓN DE PARÁMETROS DE LA CÁMARA Y ZONA ---
CAMERA_NAME = "Camara_Principal"
AREA_VIGILADA = "Entrada Principal"
CAMERA_IP_URL = os.getenv("CAMERA_IP_URL")

# --- CONFIGURACIÓN DE LÓGICA DE REGISTRO ---
COOLDOWN = timedelta(seconds=5)
FRAME_QUEUE_MAX_SIZE = 10 

# ==============================================================================
# ⚙️ 2. INICIALIZACIÓN DE COMPONENTES
# ==============================================================================

# 2.1. CONEXIÓN A MONGODB
try:
    if not MONGO_URI:
        raise ValueError("MONGO_URI no está definida en el entorno.")
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    fs = gridfs.GridFS(db)
    asistencias_collection = db['asistencias']
    horarios_collection = db['horarios']
    print("✔ Conexión a MongoDB establecida.")
except Exception as error:
    print(f"❌ ERROR: No se pudo conectar a MongoDB: {error}")
    db, fs, asistencias_collection, horarios_collection = None, None, None, None


# 2.2. CARGA DEL MODELO YOLO
try:
    model = YOLO(MODELO_YOLO)
    print(f"✔ Modelo YOLO '{MODELO_YOLO}' cargado.")
except Exception:
    print(f"❌ ERROR: No se pudo cargar el modelo YOLO.")
    model = None


# 2.3. CARGA DE CODIFICACIONES DE ROSTROS
reference_encodings, reference_names = [], []

def generate_encodings(ref_dir, pkl_file):
    """Genera las codificaciones desde el directorio de fotos y guarda el PKL."""
    print("⏳ Generando nuevas codificaciones... esto puede tardar.")
    encs, names = [], []
    for person_name in os.listdir(ref_dir):
        person_path = os.path.join(ref_dir, person_name)
        if os.path.isdir(person_path):
            for filename in os.listdir(person_path):
                if filename.lower().endswith(('.jpg', '.png', '.jpeg')):
                    img_path = os.path.join(person_path, filename)
                    image = cv2.imread(img_path)
                    if image is not None:
                        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                        encodings = face_recognition.face_encodings(rgb)
                        if encodings:
                            encs.extend(encodings)
                            names.extend([person_name] * len(encodings))
    
    if encs:
        with open(pkl_file, 'wb') as f:
            pickle.dump((encs, names), f)
        print(f"✔ {len(encs)} codificaciones cargadas y guardadas en '{pkl_file}'.")
    else:
        print("🔴 ADVERTENCIA: No se encontraron rostros válidos para codificar.")
    return encs, names

# Lógica para Cargar o Generar el PKL
if os.path.exists(PICKLE_FILE):
    try:
        with open(PICKLE_FILE, 'rb') as f:
            reference_encodings, reference_names = pickle.load(f)
        print(f"✔ Codificaciones cargadas desde '{PICKLE_FILE}'.")
    except Exception:
        print("❌ Error al cargar el archivo pickle. Regenerando.")
        reference_encodings, reference_names = generate_encodings(REFERENCE_DIRECTORY, PICKLE_FILE)
else:
    reference_encodings, reference_names = generate_encodings(REFERENCE_DIRECTORY, PICKLE_FILE)


# 2.4. VARIABLES GLOBALES DE ESTADO
puestos = {
    "alexis_alvizar": "Jefe",
    "ricardo_andrade": "Empleado"
}
registro_personal = {}


# ==============================================================================
# 🚀 3. FUNCIONES DE REGISTRO Y COMUNICACIÓN EXTERNA
# ==============================================================================

def enviar_rostro_api(nombre, puesto, estado, timestamp, frame_id=None):
    """Envía los datos de detección a la API externa."""
    data = {
        "nombre": nombre,
        "puesto": puesto,
        "estado": estado,
        "timestamp": timestamp,
        "frame_id": str(frame_id) if frame_id else None
    }
    try:
        requests.post(API_URL, json=data, timeout=3)
    except requests.exceptions.RequestException:
        print("❌ Error de conexión con la API (o timeout).")

def registrar_asistencia_yolo(timestamp, frame_capture):
    """Guarda la captura de detección de persona (YOLO) en MongoDB (GridFS)."""
    if fs is None:
        return print("⚠ BD no disponible. Asistencia no registrada.")

    asistencia_data = {
        "timestamp": timestamp,
        "camera_name": CAMERA_NAME,
        "area": AREA_VIGILADA
    }
    
    try:
        frame_id = fs.put(frame_capture, filename=f'{timestamp}_captura.jpg', content_type='image/jpeg')
        asistencia_data['frame_id'] = frame_id
        asistencias_collection.insert_one(asistencia_data)
        print(f"📌 Asistencia (YOLO) registrada en BD: {timestamp}")
    except Exception as e:
        print(f"❌ ERROR al guardar asistencia en BD/GridFS: {e}")

def guardar_rostro_conocido(nombre, rostro):
    """Aplica la lógica de cooldown y horario, y registra en API/BD."""
    ahora = datetime.now()
    ahora_str = ahora.strftime('%Y-%m-%d %H:%M:%S')

    # 1. Obtener horario 
    hora_inicio, hora_fin = datetime.strptime("00:00", "%H:%M").time(), datetime.strptime("23:59", "%H:%M").time()
    if horarios_collection:
        horario = horarios_collection.find_one({"nombre": nombre})
        if horario:
            hora_inicio = datetime.strptime(horario["hora_inicio"], "%H:%M").time()
            hora_fin = datetime.strptime(horario["hora_fin"], "%H:%M").time()

    hora_actual = ahora.time()

    # 2. Lógica de Cooldown y Estado
    if nombre in registro_personal:
        ultima = registro_personal[nombre]['ultimo']
        estado_actual = registro_personal[nombre]['estado']
        
        if ahora - ultima < COOLDOWN:
            return 

        if hora_actual >= hora_fin and estado_actual == 'entrada':
            # Se marca Ausente (Salida)
            enviar_rostro_api(nombre, puestos.get(nombre, "Desconocido"), "Ausente", ahora_str)
            registro_personal[nombre] = {"ultimo": ahora, "estado": "salida"}
            print(f"🔴 {nombre} marcado como Ausente por fin de horario.")
            return

        if hora_actual < hora_fin and estado_actual == 'entrada':
            registro_personal[nombre]['ultimo'] = ahora
            return

    # 3. Registro de ENTRADA (Solo si está dentro del horario)
    if hora_actual >= hora_inicio and hora_actual < hora_fin:
        frame_id = None
        if fs:
            _, buffer = cv2.imencode('.jpg', rostro)
            try:
                frame_id = fs.put(buffer.tobytes(), filename=f'{ahora_str}_{nombre}.jpg', content_type='image/jpeg')
            except Exception as e:
                print(f"❌ ERROR al guardar rostro en GridFS: {e}")

        enviar_rostro_api(nombre, puestos.get(nombre, "Desconocido"), "Presente", ahora_str, frame_id)
        registro_personal[nombre] = {"ultimo": ahora, "estado": "entrada"}
        print(f"🟢 {nombre} marcado como Presente (Entrada).")
    else:
        pass


# ==============================================================================
# 🔄 4. FUNCIONES DE PROCESAMIENTO Y EJECUCIÓN MODULAR
# ==============================================================================

def choose_camera():
    """Pregunta al usuario y selecciona la fuente de video."""
    print("Selecciona la fuente de video:")
    print("1. Cámara de PC")
    print("2. Cámara IP")
    opt = input("Elige (1 o 2): ")
    if opt == '2':
        if not CAMERA_IP_URL:
            print("❌ CAMERA_IP_URL no está definida en el entorno.")
            return cv2.VideoCapture()
        return cv2.VideoCapture(CAMERA_IP_URL)
    return cv2.VideoCapture(0)

def choose_mode():
    """Pregunta al usuario y selecciona el modo de procesamiento."""
    print("\nSelecciona el modo de procesamiento (IMPACTO EN EL RENDIMIENTO):")
    print("1. Solo Reconocimiento Facial (Lento)")
    print("2. Solo Detección de Objetos/YOLO (Rápido)")
    print("3. Ambos (Más Lento / Máximo consumo)")
    mode = input("Elige (1, 2 o 3): ")
    return int(mode) if mode.isdigit() and 1 <= int(mode) <= 3 else 3

def capture_frames(q):
    """Hilo 1: Captura frames de la cámara y los pone en una cola."""
    cam = choose_camera()
    if not cam.isOpened():
        print("❌ ERROR: No se pudo abrir la fuente de video.")
        return

    while True:
        ret, frame = cam.read()
        if not ret:
            print("🔴 Error de lectura de cámara.")
            time.sleep(1) 
            continue
        
        if q.full():
            q.get() 
        q.put(frame)

    cam.release()

def process_faces(frame):
    """Optimización: Procesa la detección de rostros en un frame reducido."""
    small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
    rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    
    locations = face_recognition.face_locations(rgb)
    encodings = face_recognition.face_encodings(rgb, locations)
    names = []

    for encoding in encodings:
        name = "Desconocido"
        if reference_encodings:
            matches = face_recognition.compare_faces(reference_encodings, encoding)
            if True in matches:
                name = reference_names[matches.index(True)]
        names.append(name)

    locations = [(top*2, right*2, bottom*2, left*2) for (top, right, bottom, left) in locations]
    return locations, names


def process_frames(q, mode):
    """Hilo 2: Aplica la lógica de procesamiento según el modo seleccionado."""
    
    last_yolo_asistencia_time = None
    
    yolo_activo = mode in [2, 3]
    face_activo = mode in [1, 3]

    print(f"Modo seleccionado: {'Facial' if mode == 1 else 'YOLO' if mode == 2 else 'Ambos'}.")
    
    while True:
        # **SALIDA CON 'q'**
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        if not q.empty():
            frame = q.get()
            now = datetime.now()
            
            annotated_frame = frame.copy() 

            # --- Detección YOLO (MODOS 2 y 3) CORREGIDA ---
            if yolo_activo and model is not None:
                # Usando el umbral de confianza bajo para detectar Cuchilla/Arma
                results = model.predict(frame, imgsz=640, conf=CONFIDENCE_THRESHOLD, verbose=False) 
                
                boxes = results[0].boxes
                annotated_frame = results[0].plot()

                # Lógica de registro de Asistencia (YOLO): SOLO si hay detecciones
                if len(boxes) > 0:
                    
                    deteccion_humano = False
                    # Iterar sobre las clases detectadas
                    for r in boxes.cls:
                        class_id = int(r.item()) 
                        # Comprobar "humano", "Cuchilla" o "Arma" (asumiendo que estos nombres están en model.names)
                        if model.names[class_id].lower() in ['humano', 'cuchilla', 'arma']:
                            deteccion_humano = True
                            break 
                    
                    if deteccion_humano:
                        if last_yolo_asistencia_time is None or (now - last_yolo_asistencia_time) > COOLDOWN:
                            last_yolo_asistencia_time = now
                            timestamp = now.strftime('%Y-%m-%d %H:%M:%S')
                            _, buffer = cv2.imencode('.jpg', annotated_frame) 
                            threading.Thread(target=registrar_asistencia_yolo, args=(timestamp, buffer.tobytes(),), daemon=True).start()
            
            # --- Reconocimiento Facial (MODOS 1 y 3) ---
            if face_activo and reference_encodings:
                face_locations, names = process_faces(frame)
                
                if not yolo_activo:
                    annotated_frame = frame.copy() 

                # Anotación y Registro Facial
                for (top, right, bottom, left), name in zip(face_locations, names):
                    color = (0, 255, 0) if name != "Desconocido" else (0, 0, 255)
                    cv2.rectangle(annotated_frame, (left, top), (right, bottom), color, 2)
                    cv2.rectangle(annotated_frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
                    cv2.putText(annotated_frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

                    if name != "Desconocido":
                        rostro = frame[top:bottom, left:right]
                        threading.Thread(target=guardar_rostro_conocido, args=(name, rostro,), daemon=True).start()


            # --- Visualización (9:16) ---
            try:
                display_frame = cv2.resize(
                    annotated_frame, 
                    (DISPLAY_WIDTH, DISPLAY_HEIGHT), 
                    interpolation=cv2.INTER_LINEAR
                )
                cv2.imshow("Vigilancia AI (YOLO + Rostros)", display_frame)
            except Exception as e:
                print(f"❌ Error al mostrar/reescalar el frame: {e}")

        # Pequeño sleep si la cola está vacía
        if q.empty():
            time.sleep(0.01) 

    cv2.destroyAllWindows()


# ==============================================================================
# 🏁 5. EJECUCIÓN DEL PROGRAMA PRINCIPAL
# ==============================================================================

if __name__ == "__main__":
    
    if not reference_encodings and os.path.isdir(REFERENCE_DIRECTORY):
        print("🔴 ERROR FATAL: No hay codificaciones de rostros. El reconocimiento facial no funcionará.")
    
    print("\n--- INICIANDO SISTEMA DE VIGILANCIA AI ---")
    
    # --- SELECCIÓN DE MODO ---
    processing_mode = choose_mode()
    
    # 5.1. Inicialización de la Cola y los Hilos
    frame_q = queue.Queue(maxsize=FRAME_QUEUE_MAX_SIZE)
    
    # Hilo 1: Captura de Frames
    thread_capture = threading.Thread(target=capture_frames, args=(frame_q,), daemon=True)
    
    # Hilo 2: Procesamiento (Pasa el modo seleccionado)
    thread_process = threading.Thread(target=process_frames, args=(frame_q, processing_mode,), daemon=True)
    
    thread_capture.start()
    thread_process.start()
    
    try:
        # El hilo principal espera a que los hilos terminen
        thread_capture.join() 
        thread_process.join() 
    except KeyboardInterrupt:
        print("\nPrograma terminado por el usuario (Ctrl+C).")
    
    print("Sistema apagado.")
