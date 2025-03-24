# Assessment: Web Scraping de Productos de Despensa

## Objetivo

Desarrollar un script en TypeScript utilizando Puppeteer para extraer la siguiente información de cada producto de la categoría **"Despensa"** en la URL:

- **Categoría**
- **Subcategoría**
- **Nombre**
- **Marca**
- **Imagen (URL)**
- **Flexibilidad del empaque** (determinado mediante IA)

Además, el script debe recorrer todas las páginas disponibles de la categoría, analizar la imagen de cada producto con Google Cloud Vision para determinar la subcategoría y si el empaque es flexible, y finalmente guardar la información extraída en archivos **JSON** y **CSV**.

## Requisitos

- **Extracción de Datos:**  
  Obtener los datos mencionados para cada producto.

- **Paginación:**  
  Recorrer todas las páginas disponibles usando el parámetro `page` en la URL.

- **Análisis de Imagen con IA:**
    - Enviar la imagen del producto a Google Cloud Vision para obtener etiquetas (usando `LABEL_DETECTION`).
    - Aplicar fuzzy matching entre las etiquetas detectadas y las candidate labels (subcategorías disponibles extraídas del DOM) para asignar la subcategoría.
    - Determinar si el empaque es flexible usando candidate labels fijas: `["Flexible", "No flexible"]`.

- **Entrega de Datos:**  
  Guardar la información en formatos estructurados (JSON y CSV).


## Configuración y Preparación

### 1. Habilitar la API de Google Cloud Vision

1. Inicia sesión en [Google Cloud Console](https://console.cloud.google.com/).
2. Crea o selecciona un proyecto.
3. Habilita la **Vision API** en la biblioteca de APIs.
4. Habilita la facturación para poder utilizar la API (incluso para el nivel gratuito).
5. Ve a la sección de **Credenciales** y crea una nueva clave API.

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido (reemplaza los valores por los reales):

```env
GOOGLE_API_KEY=TU_CLAVE_API_REAL
AI_ENDPOINT=https://vision.googleapis.com/v1/images:annotate

