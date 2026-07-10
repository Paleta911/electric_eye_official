# Guía de contribución

Gracias por tu interés en contribuir a Electric Eye.

Este repositorio es público, pero el proyecto maneja componentes sensibles como autenticación, imágenes, datos biométricos, cámaras y credenciales. Por eso, todo cambio debe pasar por revisión antes de llegar a `main`.

## Contacto para contribuciones

Para dudas, coordinación o propuestas de colaboración:

- Correo: [jesusarc6804@gmail.com](mailto:jesusarc6804@gmail.com)
- Teléfono: [+52 271-388-2691](tel:+522713882691)

## Reglas principales

- No hagas push directo a `main`.
- Crea una rama por cada cambio.
- Abre un Pull Request hacia `main`.
- No subas credenciales, archivos `.env`, datasets privados, fotografías reales ni datos biométricos.
- Mantén los cambios pequeños y relacionados.
- Explica qué cambiaste, por qué y cómo lo validaste.

## Flujo de trabajo

1. Actualiza tu copia local de `main`:

   ```bash
   git switch main
   git pull --ff-only origin main
   ```

2. Crea una rama descriptiva:

   ```bash
   git switch -c feature/descripcion-breve
   ```

   Prefijos recomendados:

   - `feature/` para nuevas funcionalidades.
   - `fix/` para correcciones.
   - `docs/` para documentación.
   - `chore/` para mantenimiento.
   - `security/` para mejoras de seguridad.

3. Realiza tus cambios y crea commits claros:

   ```bash
   git add <archivos>
   git commit -m "Describe el cambio"
   ```

4. Publica tu rama:

   ```bash
   git push -u origin feature/descripcion-breve
   ```

5. Abre un Pull Request hacia `main`.

6. Atiende comentarios de revisión y espera a que las validaciones pasen.

## Validaciones recomendadas

Antes de abrir un Pull Request, ejecuta las validaciones relacionadas con tu cambio.

### Backend

```bash
cd backend
npm test
npm audit --omit=dev
```

### Frontend

```bash
cd frontend
npm run build
npm test -- --watch=false --browsers=ChromeHeadless --reporters=progress
npm audit --omit=dev
```

## Seguridad

Nunca incluyas secretos reales en commits. Esto incluye:

- `.env`
- URIs de MongoDB con usuario/contraseña
- URLs RTSP con credenciales
- tokens de GitHub
- claves JWT
- claves de ingesta de IA
- fotografías o datos biométricos reales

Si una credencial se sube accidentalmente a Git, debe revocarse y rotarse. Borrarla en un commit posterior no elimina el secreto del historial.

## Rama `main`

`main` es la rama estable del proyecto y está protegida en GitHub. Los cambios deben entrar mediante Pull Request con revisión.
