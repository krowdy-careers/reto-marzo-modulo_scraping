🛒 Tottus Scraper Server
Servidor web para scraping de productos de Tottus con análisis de empaques usando Google Cloud Vision API.

🚀 Características Principales

Scraping automatizado de productos

Análisis de empaques flexibles mediante IA

API REST para consultas

Almacenamiento automático en JSON

Integración con Google Cloud Vision

📦 Requisitos Previos

Node.js 18+

Cuenta de Google Cloud con:

Vision API habilitada

Facturación activada

Archivo de credenciales JSON (service account)

🛠️ Instalación


git clone https://github.com/JairGZZ/reto-marzo-modulo_scraping.git
cd tottus-server
npm install
npm run build  # Opcional para compilar TypeScript
⚙️ Configuración

Crea un proyecto en Google Cloud Console y habilita Vision API

Descarga el archivo JSON de tu cuenta de servicio

Crea un archivo .env con:


PORT=3000
CREDENTIALS_PATH= nombre-de-tu-archivo.json ()
🖥️ Ejecución


npm run dev  # Modo desarrollo (con reinicio automático)
npm start    # Modo producción
Resultados guardados en: data/productos-YYYY-MM-DDTHH-mm-ss-sssZ.json

📡 API Endpoints
Ingrese a su navegar favorito y pegue http://localhost:8080/scrape luego de instalar las dependencias e iniciar el proyecto
GET /scrape - Devuelve productos analizados. Ejemplo de respuesta:


{
  "success": true,
  "data": [{
    "name": "Aceite Vegetal Premium 900 ml",
    "price": "S/ 11",
    "empaqueFlexible": "No",
    "marca" : "PRIMOR"
  }]
}
⚠️ Notas Importantes

Costos: Google Cloud Vision API tiene tarifas (ver precios en cloud.google.com/vision/pricing)

Primer producto detectado con empaque flexible:


{"name": "Fourpack Gelatina Sabor Naranja Yopi 480 g", "empaqueFlexible": "Sí"}
🔍 Solución de Problemas

Error PERMISSION_DENIED: Verifica facturación y permisos de la cuenta de servicio

Timeout en scraping: Aumenta el valor de timeout en tottus.service.ts



📄 Licencia
MIT License - Detalles en el archivo LICENSE