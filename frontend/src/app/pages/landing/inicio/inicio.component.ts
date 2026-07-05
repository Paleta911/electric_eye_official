import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ Importar CommonModule
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faHandsHelping, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface Card {
  title: string;
  text: string;
  image: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  imports: [RouterModule, CommonModule, FontAwesomeModule] // ✅ Añadir CommonModule aquí
})
export class InicioComponent {
 cards: Card[] = [
  {
    title: 'Detección de Intrusos',
    text: 'Identificamos y rastreamos personas en todo momento dentro de las instalaciones gracias a un sistema avanzado de análisis de video. Nuestra tecnología detecta movimientos sospechosos y presencia no autorizada, incluso en condiciones de poca iluminación. El sistema genera alertas en tiempo real que notifican inmediatamente al personal de seguridad, facilitando una respuesta rápida ante cualquier incidente. Además, el historial de detecciones queda registrado para auditorías o investigaciones posteriores, ofreciendo un nivel superior de control y vigilancia continua.',
    image: 'https://computerhoy.20minutos.es/sites/navi.axelspringer.es/public/media/image/2020/09/reconocimiento-facial-2074371.jpg'
  },
  {
    title: 'Seguridad Inteligente',
    text: 'Nuestro sistema clasifica y reconoce objetos de forma automática mediante inteligencia artificial entrenada para diferenciar entre elementos cotidianos y amenazas potenciales. Detecta armas, herramientas de intrusión, paquetes abandonados y cualquier objeto que represente un riesgo para la seguridad del entorno. La tecnología permite también analizar comportamientos inusuales o patrones de movimiento que puedan anticipar incidentes, minimizando los tiempos de reacción. Estas capacidades avanzadas se integran con tus sistemas de seguridad existentes para optimizar el monitoreo y reducir falsas alarmas.',
    image: 'https://visionplatform.ai/wp-content/uploads/2024/01/object-detection.png'
  },
  {
    title: 'Reconocimiento Facial',
    text: 'Integramos reconocimiento facial de última generación que permite gestionar accesos y pases de asistencia de manera automática, eliminando la necesidad de credenciales físicas. Nuestro sistema identifica personas conocidas o desconocidas con alta precisión y velocidad, incluso en flujos de entrada masivos, garantizando la autenticación biométrica confiable. Además, permite generar reportes de acceso, restringir zonas sensibles y recibir notificaciones inmediatas si se detecta un rostro no autorizado. Estas funcionalidades optimizan la seguridad de tu organización mientras ofrecen una experiencia ágil y moderna a los usuarios autorizados.',
    image: 'https://epe.brightspotcdn.com/dims4/default/3440acf/2147483647/strip/true/crop/1695x1150+13+0/resize/840x570!/quality/90/?url=https%3A%2F%2Fepe-brightspot.s3.us-east-1.amazonaws.com%2F53%2Fc9%2F8a96a2eb465e89e9d18fa364a671%2F102023-lead-image-facial-recognition-gt.jpg'
  }
];


  selectedCard = this.cards[0];

  constructor(library: FaIconLibrary) {
    library.addIcons(faBriefcase, faHandsHelping, faCheckCircle);
  }

  selectCard(card: Card) {
    this.selectedCard = card;
  }
}
