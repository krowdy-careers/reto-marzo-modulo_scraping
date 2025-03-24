# Tottus Product Scraper

Este proyecto implementa un web scraper que extrae información de productos de la sección "Despensa" del supermercado Tottus Perú, y utiliza inteligencia artificial para analizar las imágenes de los productos y determinar si tienen empaque flexible o rígido.

## Características

- **Extracción de datos completa**: Obtiene categoría, subcategoría, nombre, marca, imagen (URL), precio y enlace de cada producto.
- **Paginación automática**: Navega a través de todas las páginas disponibles de la categoría.
- **Análisis de imagen con IA**: Utiliza un modelo de visión artificial para clasificar los empaques como flexibles o rígidos.
- **Almacenamiento estructurado**: Guarda los datos en formato CSV para fácil análisis.

## Requisitos previos

- Node.js (v14 o superior)
- NPM o Yarn
- Acceso a internet
- **Ollama** - Herramienta local para ejecutar modelos de IA

## Instalación

1. Clonar este repositorio:
   ```
   git clone https://github.com/tuusuario/reto-puppeteer.git
   cd reto-puppeteer
   ```

2. Instalar las dependencias:
   ```
   npm install
   ```

3. **Instalar y configurar Ollama**:
   - Descargar Ollama desde [https://ollama.ai/download](https://ollama.ai/download)
   - Instalar siguiendo las instrucciones para tu sistema operativo
   - Una vez instalado, descargar el modelo necesario ejecutando:
     ```
     ollama pull deepseek-r1:latest
     ```
   - Asegúrate de que Ollama esté en ejecución para el análisis de imágenes

## Configuración

El proyecto utiliza un archivo de configuración ubicado en `src/config/config.js` donde puedes ajustar diferentes parámetros:

- URLs de scraping
- Número máximo de páginas a procesar
- Rutas de salida para archivos
- Configuración de tiempos de espera
- Parámetros del navegador (headless, etc.)
- **Configuración de Ollama**:
  - `IMAGE_CONFIG.ollamaEndpoint`: URL del endpoint de Ollama (por defecto: http://localhost:11434/api/generate)
  - `IMAGE_CONFIG.model`: Modelo a utilizar (por defecto: deepseek-r1:latest)
  - `IMAGE_CONFIG.maxConcurrentAnalyses`: Número máximo de análisis concurrentes


En `src/scraper/pageExtractor.js` se encuentra la configuración de la cantidad máxima de páginas:

```javascript
async function getTotalPages(browser, baseUrl) {
  console.log('🔍 Detectando número total de páginas...');
  
  const page = await browser.newPage();
  
  try {
    // Comenzamos con un umbral alto pero razonable
    const maxPagesToCheck = 100;  // <----- Modificar para definir un límite
    let lastValidPage = 1;
```

## Uso

Para ejecutar el programa completo:

```
node index.js
```

Para ejecutar solo el scraping sin análisis de imágenes:

```
node src/scraper.js
```

Para analizar imágenes de un archivo CSV existente:

```
node src/imageAnalysis.js --input=ruta/al/archivo.csv
```

## Estructura del proyecto

```
reto-puppeteer/
├── index.js                # Punto de entrada principal
├── src/
│   ├── scraper/         # Lógica de web scraping
│   ├── imageAnalysis/    # Análisis de imágenes con IA
│   ├── utils/              # Funciones de utilidad
│   └── config/             # Configuraciones
│       └── config.js       # Parámetros configurables
```

## Cómo funciona

### Web Scraping

El proceso de scraping utiliza Puppeteer para:

1. Iniciar una instancia de navegador Chrome
2. Navegar a la página de la categoría Despensa
3. Extraer datos de los productos en la página actual
4. Detectar y navegar a través de todas las páginas disponibles
5. Manejar posibles errores, tiempos de espera o bloqueos
6. Guardar los datos extraídos en formato CSV

### Análisis de Imágenes

El análisis de imágenes utiliza un servicio de IA para:

1. Leer el archivo CSV con datos de productos
2. Por cada producto, enviar la imagen al servicio de IA
3. Proporcionar un prompt que instruye al modelo a identificar si el empaque es flexible o rígido
4. Interpretar la respuesta del modelo
5. Actualizar el CSV con una nueva columna "Tipo de Empaque" (Flexible/Rígido)