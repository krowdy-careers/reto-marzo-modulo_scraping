# Tottus Web Scraper - Chrome Extension

Este proyecto es una **extensión de Chrome** que realiza **web scraping** de productos de la categoría **Despensa** en Tottus Perú. Además, usa **IA gratuita** para analizar imágenes y determinar si el empaque del producto es flexible.

## Funcionalidades

✔ **Scraping** de productos en la categoría Despensa.  
✔ **Manejo de paginación** para extraer todos los productos.  
✔ **Análisis de imágenes con IA** para detectar empaques flexibles.  
✔ **Exportación de datos** en formato JSON.  
✔ **Interfaz de usuario simple y estilizada**.

---

## Instalación

### 1. Instalar Dependencias

Este proyecto usa Puppeteer para el scraping y una IA gratuita para el análisis de imágenes. Instala las dependencias con:

```bash
npm install puppeteer
```

### 3. Ejecutar el Servidor Local

El scraping se ejecuta en un servidor local:

```bash
node src/scraping/scraper.js
```

### 4. Carga la Extensión en Chrome
