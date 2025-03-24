Detector de Empaques Flexibles - README
Descripción
Este proyecto es una herramienta para extraer información de productos de la tienda online Tottus y determinar automáticamente si los productos vienen en empaques flexibles. Utiliza una combinación de técnicas:

Web scraping para obtener datos de productos
OCR (Reconocimiento óptico de caracteres) para extraer texto de imágenes
Análisis de contornos con OpenCV para detectar características visuales
Análisis heurístico basado en el nombre y características del producto
Requisitos previos
Python 3.7 o superior
Google Chrome (para Selenium)
Tesseract OCR instalado en el sistema (Descargar Tesseract)

Instalación
Instala las dependencias: pip install -r requirements.txt
Asegúrate de que Tesseract OCR esté instalado y actualiza la ruta en scraper.py si es necesario:pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

Uso
Inicia el servidor Flask:
python server.py
Abre Chrome y navega a la página de productos de Tottus
Activa la extensión haciendo clic en su icono
Haz clic en "Scrapear página" en la interfaz de la extensión
La extensión enviará los datos al servidor local para análisis
Los resultados se guardarán en productos.csv

Cómo funciona el algoritmo
El algoritmo utiliza un enfoque en tres capas para determinar si un producto viene en empaque flexible:

1. Reconocimiento Óptico de Caracteres (OCR)
Primero intenta extraer texto de la imagen del producto usando pytesseract y busca palabras clave como "bolsa", "sachet", "doypack" (flexibles) o "botella", "frasco", "lata" (no flexibles).

2. Análisis de contornos con OpenCV
Si el OCR no es concluyente, analiza los contornos en la imagen. Los empaques flexibles tienden a tener más contornos debido a los pliegues y texturas.

3. Análisis basado en nombres y características
Como método de respaldo, usa el nombre del producto, marca y características (como tamaño/peso) para determinar el tipo de empaque basado en reglas heurísticas.

Resultados
El archivo productos.csv contiene los resultados del análisis con las siguientes columnas:

category: Categoría del producto
name: Nombre del producto
brand: Marca del producto
image_url: URL de la imagen del producto
is_flexible: Resultado del análisis ("Sí", "No", "Indeterminado" o "Error")
Solución de problemas
Error 403 al acceder a las imágenes
El sitio de Tottus utiliza Cloudflare para proteger sus imágenes. Si encuentras errores 403, el sistema recurrirá automáticamente al análisis basado en nombres.

OCR no detecta texto correctamente
Asegúrate de que Tesseract esté instalado correctamente. Para mejorar los resultados:

Ajusta los parámetros en la configuración de pytesseract
Usa preprocesamiento de imágenes adicional
Limitaciones y posibles mejoras
Acceso a imágenes: Actualmente, las protecciones del CDN dificultan el acceso directo a las imágenes.
Precisión del OCR: La calidad del texto extraído depende mucho de la calidad de la imagen.
Precisión de las heurísticas: El análisis basado en nombres funciona bien para productos comunes, pero puede fallar en casos especiales.