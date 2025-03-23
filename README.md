# Web Scraping de Productos de Despensa

## **🚀 Descripción:**

Este proyecto utiliza Node.js y Express para realizar web scraping y clasificación de productos. Para ello, se emplean las siguientes tecnologías:

- Puppeteer y Puppeteer Cluster: Permiten realizar scraping abriendo múltiples instancias de navegador en paralelo.

- Hugging Face Inference API: Se usa para clasificar los productos obtenidos en base a sus imágenes.

- Express: Maneja el servidor y las rutas de la API.

### Endpoints principale:

- `/scrape`: Realiza el scraping de productos.
- `/classify`: Clasifica los productos obtenidos utilizando IA.

## 📦 Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/tu_usuario/tu_repositorio.git
   ```
2. Instala las dependencias con Yarn:
   ```
   yarn install
   ```
3. Crea un archivo .env y agrega tu API key de Hugging Face:
   ```
   HF_ACCESS_TOKEN=tu_token_aqui
   ```
4. Inicia el servidor:
   ```
   yarn start
   ```

### Endpoints disponibles:

- **GET /** → Verifica que el servidor está corriendo.
- **GET /scrape** → Ejecuta el proceso de scraping.
- **GET /classify** → Clasifica los productos obtenidos mediante IA.

###📌 Funcionalidades principales:

- **Scraping con Puppeteer y Puppeteer Cluster**: Obtiene datos de productos mediante múltiples instancias en paralelo.
- **Clasificación con Hugging Face Inference API**: Analiza las imágenes de los productos y añade un campo de true o false.
- **Servidor con Express**: Expone endpoints para ejecutar las funcionalidades.

## ⚠️ Limitaciones

Este proyecto utiliza la API de **Hugging Face** para la clasificación de imágenes. En su versión gratuita, el número de solicitudes está **limitado a 1,000 por día**.  
Por esta razón, el análisis de productos está **limitado a 500 por defecto**.

## 🛠 Tecnologías

- **Node.js**
- **Express**
- **Puppeteer**
- **Puppeteer Cluster**
- **@huggingface/inference**

## ⏳ Tiempo de Procesamiento

El scraping puede tardar un tiempo en completarse porque:

- **Se extraen productos de 24 páginas**, lo que implica múltiples solicitudes.
- **Las imágenes deben cargarse completamente** antes de ser analizadas por la IA.
- **Se usa Puppeteer Cluster** para optimizar el tiempo al ejecutar múltiples instancias en paralelo.

A pesar de estas optimizaciones, el tiempo de espera dependerá de la velocidad de la red y del número de productos a procesar.

## 📜 Licencia

Este proyecto está bajo la licencia MIT. ¡Siéntete libre de contribuir!

---

✍️ **Autor:** [Julia Cruz Pérez](https://github.com/jjuliacp)
