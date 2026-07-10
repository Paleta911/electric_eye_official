# Electric Eye

Electric Eye es un sistema de vigilancia inteligente desarrollado para integrar cámaras, reconocimiento facial, detección mediante IA y un panel web de administración.

El proyecto combina una aplicación de IA en Python, un backend en Node.js/Express, una base de datos MongoDB y un frontend en Angular para registrar eventos, consultar asistencias, revisar capturas y administrar usuarios del sistema.

## ¿Qué problema resuelve?

Electric Eye busca centralizar el monitoreo de cámaras y el registro de eventos detectados por IA. Está orientado a escenarios donde se necesita:

- Detectar actividad desde una cámara o fuente de video.
- Identificar rostros previamente registrados.
- Registrar asistencias o eventos asociados a personas detectadas.
- Consultar evidencia visual desde un panel web.
- Administrar usuarios, activación de cuentas y acceso al sistema.

## Funcionalidades principales

- Panel web con Angular 21.
- Backend REST con Node.js, Express y MongoDB.
- Integración con IA en Python mediante `Main.py`.
- Reconocimiento facial usando codificaciones locales.
- Detección basada en modelo YOLO.
- Registro de asistencias/eventos.
- Administración de usuarios y claves de activación.
- Autenticación con JWT y soporte para 2FA/TOTP.
- Protección de endpoints sensibles mediante sesión activa, rol de administrador y clave de ingesta para la IA.
- Manejo seguro de secretos mediante `.env`.

## Arquitectura general

```text
┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│ Cámara/Video │ ---> │ IA en Python    │ ---> │ Backend API  │
│              │      │ Main.py         │      │ Express      │
└──────────────┘      └─────────────────┘      └──────┬───────┘
                                                        │
                                                ┌───────▼───────┐
                                                │ MongoDB       │
                                                └───────┬───────┘
                                                        │
                                                ┌───────▼───────┐
                                                │ Frontend      │
                                                │ Angular       │
                                                └───────────────┘
```

## Stack tecnológico

- Frontend: Angular 21, TypeScript, Bootstrap.
- Backend: Node.js, Express, MongoDB.
- IA / visión por computadora: Python, OpenCV, YOLO, reconocimiento facial.
- Base de datos: MongoDB.
- Seguridad: JWT, 2FA/TOTP, CORS restringido, Helmet, rate limiting y variables de entorno.

## Seguridad y privacidad

Este proyecto maneja información sensible, incluyendo posibles datos biométricos, imágenes, credenciales de cámaras y claves de acceso. Por esa razón:

- Los secretos reales deben vivir únicamente en `.env` o en un gestor de secretos.
- El archivo `.env` no debe subirse a Git.
- Las claves de activación se generan desde el backend y son de un solo uso.
- Los enlaces a imágenes biométricas son firmados y expiran.
- Las contribuciones no deben incluir datasets privados, fotografías reales, modelos sensibles ni credenciales.

Consulta la guía de instalación para configurar el entorno local de forma segura.

## Instalación y ejecución

El instructivo completo está en:

[INSTALACION.md](INSTALACION.md)

Ahí se documentan los requisitos, dependencias, configuración de `.env`, ejecución del backend, frontend e IA.

## Contribuir

La rama `main` está protegida. Los cambios deben hacerse en una rama independiente y enviarse mediante Pull Request.

Lee la guía completa antes de contribuir:

[CONTRIBUTING.md](CONTRIBUTING.md)

Para dudas sobre contribuciones o coordinación del proyecto:

- Correo: [jesusarc6804@gmail.com](mailto:jesusarc6804@gmail.com)
- Teléfono: [+52 271-388-2691](tel:+522713882691)

## Estado del proyecto

Electric Eye nació como un proyecto universitario y fue actualizado para mejorar su seguridad, documentación, flujo de colaboración y compatibilidad con Angular 21.

## Licencia

Electric Eye se distribuye bajo la [GNU Affero General Public License v3.0 únicamente](LICENSE) (`AGPL-3.0-only`).

Copyright © 2026 Paleta911.
