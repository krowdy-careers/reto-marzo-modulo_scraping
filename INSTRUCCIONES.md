**Assessment: Web Scraping de Productos de Despensa**

### **Objetivo:**

Desarrollar un script utilizando una Chrome Extension o Puppeteer para scrapear los productos de la categoría "Despensa" en la siguiente URL:
[https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa](https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa)

### **Requisitos:**

1. **Extracción de Datos**
   - El script debe obtener la siguiente información para cada producto:
     - Categoría
     - Subcategoría
     - Nombre
     - Marca
     - Imagen (URL)
2. **Paginación**
   - Implementar la lógica necesaria para navegar a través de todas las páginas disponibles de la categoría.
3. **Análisis de Imagen con IA**
   - Enviar la imagen del producto a un algoritmo de IA para determinar si el empaque es flexible.
   - Debería haber un campo configurable para ingresar la API Key de la API de IA o alguna librería de OCR utilizada.
4. **Entrega de Datos**
   - Guardar la información obtenida en un formato estructurado como JSON o CSV.

### **Criterios de Evaluación:**

- Correcta extracción de la información solicitada.
- Manejo adecuado de la paginación.
- Integración con un modelo de IA para la clasificación de empaques.
- Limpieza y estructura del código.
- Entrega de un archivo JSON o CSV con los datos extraídos.

### **Entrega:**

- Fecha Limite: Lunes 24 de Marzo hasta las 12:00PM
- PR en GitHub con el código fuente.
- Instrucciones claras para ejecutar el script.
- Archivo JSON o CSV con los datos extraídos.
- La entrega se realizará a través de un Pull Request (PR) en el repositorio de GitHub donde se encuentran estas indicaciones.

**Notas:**

- Se recomienda usar Puppeteer para simular la navegación y evitar bloqueos de la página.
- En caso de optar por una Chrome Extension, debe ser capaz de extraer y procesar la información sin interacción manual del usuario.
