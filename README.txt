Detector de Empaques Flexibles

Descripción

Este proyecto permite extraer información de productos de la tienda online de Tottus y determinar si vienen en empaques flexibles. Para esto, combina diferentes técnicas:

-Web Scraping para obtener datos de los productos.

-OCR (Reconocimiento Óptico de Caracteres) para extraer texto de las imágenes.

-Análisis de contornos con OpenCV para identificar empaques flexibles.

-Reglas heurísticas basadas en el nombre y características del producto.

Requisitos

-Python 3.7 o superior.

-Google Chrome (para Selenium).

-Tesseract OCR instalado (Descargar desde aquí).

Instalación

 1.Instalar las dependencias:
 	pip install -r requirements.txt

 2. Asegurarse de que Tesseract OCR esté instalado y actualizar la ruta en scraper.py si es necesario:
 	pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

Uso

 1.Iniciar el servidor Flask:
	python server.py
 2.Abrir Chrome y navegar a la página de productos de Tottus.

 3.Activar la extensión y hacer clic en "Scrapear página".

 4.Los datos se envían al servidor y los resultados se guardan en productos.csv.

Cómo funciona el algoritmo

El análisis para detectar empaques flexibles sigue tres pasos:

 1. OCR: Extrae texto de la imagen y busca palabras clave como "bolsa", "sachet", "doypack" (flexibles) o "botella", "frasco", "lata" (no flexibles).

 2. OpenCV: Analiza los contornos de la imagen. Los empaques flexibles suelen tener más contornos por sus pliegues.

 3. Reglas heurísticas: Usa el nombre, la marca y las características del producto para hacer una clasificación.

Resultados

El archivo productos.csv almacena la información con estas columnas:

-category: Categoría del producto.

-name: Nombre del producto.

-brand: Marca del producto.

-image_url: URL de la imagen.

is_flexible: "Sí", "No", "Indeterminado" o "Error".

Problemas Comunes

-Error 403 en las imágenes: Tottus usa protecciones en sus imágenes. Si esto pasa, se usa el nombre del producto para el análisis.

-OCR no detecta bien el texto: Verificar que Tesseract esté instalado y configurado correctamente. Se pueden mejorar los resultados con preprocesamiento de imágenes.

Mejoras a Futuro

-Optimizar el acceso a imágenes.

-Mejorar la precisión del OCR.

-Ajustar mejor las reglas heurísticas para casos especiales.

