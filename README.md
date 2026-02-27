# Jornadas Mapfre Global Risks — Q&A en Tiempo Real

Aplicación web de preguntas en tiempo real para el evento **Jornadas Mapfre Global Risks**.

## 🌐 URLs en Producción

| Página | URL | Acceso |
|--------|-----|--------|
| **Formulario público** | [thankful-meadow-0838f010f.4.azurestaticapps.net](https://thankful-meadow-0838f010f.4.azurestaticapps.net/) | Sin contraseña — acceso directo por QR |
| **Dashboard expositor** | [.../dashboard.html](https://thankful-meadow-0838f010f.4.azurestaticapps.net/dashboard.html) | PIN: `2030` |
| **Test de carga** | [.../test.html](https://thankful-meadow-0838f010f.4.azurestaticapps.net/test.html) | Uso interno |

## Tecnologías

- HTML5, CSS3, Vanilla JavaScript
- Firebase Realtime Database
- Azure Static Web Apps
- Tipografía Mapfre Display

## Estructura

```
├── index.html              # Formulario público
├── dashboard.html          # Dashboard del expositor
├── test.html               # Prueba de carga (100 preguntas)
├── css/styles.css
├── js/firebase-config.js   # Config Firebase + PIN
├── js/form.js
├── js/dashboard.js
├── assets/                 # Logos + QR
└── fonts/                  # Mapfre Display
```
