El aplicativo usa un archivo .env para definir la configuración de scraping. Asegúrate de incluir los siguientes valores:

PORT=3000 # Puerto donde se ejecuta el servidor
TARGET_URL=https://tottus.falabella.com.pe/tottus-pe/category/CATG14773/Quitamanchas-y-Blanqueadores-de-ropa # URL de la categoría de productos a scrapear (sin caracteres adicionales al final)
MAX_PAGES=5 # Número máximo de páginas a scrapear
GEMINI_API_KEY=tu_api_key # Clave de la API de Gemini

Uso de parámetros en la URL

También puedes sobrescribir la URL y el número de páginas directamente en la solicitud GET:

GET http://localhost:3000/totusScrape?url=<URL>&maxPages=<NÚMERO>

Ejemplo:

GET http://localhost:3000/totusScrape?url=https://tottus.falabella.com.pe/tottus-pe/category/CATG14773/Quitamanchas-y-Blanqueadores-de-ropa&maxPages=3

Limitaciones

La API de Gemini permite analizar hasta 19 imágenes por minuto. Si se supera este límite, algunos productos no mostrarán la información del análisis.
