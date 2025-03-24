import os
import csv
import requests
import cv2
import numpy as np
import re
import pytesseract
from PIL import Image
from io import BytesIO

# Configura pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Directorio para guardar imágenes temporales
IMG_DIR = "images"
os.makedirs(IMG_DIR, exist_ok=True)

# Cabeceras HTTP para simular un navegador real
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
    'Referer': 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
}

def extract_text_from_image(image_path_or_url):
    """Descarga la imagen y extrae el texto usando OCR"""
    try:
        if os.path.exists(image_path_or_url):
            # Si es una ruta de archivo local
            img = Image.open(image_path_or_url)
        else:
            # Si es una URL
            response = requests.get(image_path_or_url, headers=HEADERS)
            if response.status_code != 200:
                print(f"Error al descargar imagen (status: {response.status_code}): {image_path_or_url}")
                return ""
                
            img = Image.open(BytesIO(response.content))
        
        text = pytesseract.image_to_string(img, lang='spa')
        return text.lower().strip()
    except Exception as e:
        print(f"Error en OCR para {image_path_or_url}: {e}")
        return ""

def is_flexible_by_ocr(image_path_or_url):
    """Determina si el empaque es flexible basado en palabras clave en el texto"""
    text = extract_text_from_image(image_path_or_url)
    print(f"Texto extraído por OCR: {text[:100]}...") # Mostrar parte del texto extraído
    
    # Palabras clave para empaques flexibles
    flexible_keywords = [
        'bolsa', 'sachet', 'doypack', 'flexible', 'pouch', 
        'stand up', 'film', 'sobre', 'flow pack', 'blister'
    ]
    
    # Palabras clave para empaques rígidos
    rigid_keywords = [
        'botella', 'frasco', 'caja', 'lata', 'tarrina', 
        'bote', 'tetra', 'tetrapack', 'rigido'
    ]
    
    # Buscar coincidencias
    for keyword in flexible_keywords:
        if keyword in text:
            print(f"Palabra clave flexible encontrada: '{keyword}'")
            return "Sí"
            
    for keyword in rigid_keywords:
        if keyword in text:
            print(f"Palabra clave rígida encontrada: '{keyword}'")
            return "No"
            
    return None  # OCR inconcluso

def is_flexible_by_contours(image_path_or_url):
    """Determina si el empaque es flexible usando análisis de contornos"""
    try:
        if os.path.exists(image_path_or_url):
            # Si es una ruta de archivo local
            img = cv2.imread(image_path_or_url)
        else:
            # Si es una URL
            response = requests.get(image_path_or_url, headers=HEADERS)
            if response.status_code != 200:
                print(f"Error al descargar imagen (status: {response.status_code}): {image_path_or_url}")
                return "Error"

            # Convertir la imagen a array
            img_array = np.asarray(bytearray(response.content), dtype=np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            print(f"Error al cargar imagen: {image_path_or_url}")
            return "Error"

        # Procesamiento con OpenCV
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        num_contours = len(contours)
        
        print(f"Número de contornos: {num_contours}")
        return "Sí" if num_contours > 50 else "No"
    except Exception as e:
        print(f"Error en análisis de contornos: {e}")
        return "Error"

def is_flexible_by_name(name, brand):
    """Determina si un producto probablemente tiene empaque flexible basándose en su nombre"""
    name_lower = (name + " " + brand).lower()
    
    # Palabras clave para empaques flexibles
    flexible_keywords = [
        'bolsa', 'sachet', 'doypack', 'sobre', 'flexible', 
        'pouch', 'stand up', 'film', 'flow pack', 'blister',
        'molido', 'molida', 'harina'
    ]
    
    # Palabras clave para empaques rígidos
    rigid_keywords = [
        'botella', 'frasco', 'vidrio', 'lata', 'tarrina', 
        'bote', 'tetra', 'tetrapack', 'rigido', 'rígido'
    ]
    
    # Verificar tamaño: productos grandes suelen venir en empaque flexible
    size_match = re.search(r'(\d+)\s*(kg|g|ml|l)', name_lower)
    if size_match:
        size = float(size_match.group(1))
        unit = size_match.group(2).lower()
        
        # Conversión aproximada a kg/l para comparación
        if unit == 'g':
            size = size / 1000
        elif unit == 'ml':
            size = size / 1000
            
        # Productos grandes (>1kg/l) suelen venir en empaques flexibles
        if size >= 1 and ('arroz' in name_lower or 'azúcar' in name_lower):
            return "Sí"
    
    # Reglas específicas para productos comunes
    if 'aceite' in name_lower:
        return "No"  # Aceites generalmente vienen en botellas
    elif 'arroz' in name_lower or 'azúcar' in name_lower:
        return "Sí"  # Arroz y azúcar suelen venir en bolsas
    elif 'atún' in name_lower or 'conserva' in name_lower:
        return "No"  # Conservas suelen venir en latas o frascos
    elif 'gelatina' in name_lower and not ('líquida' in name_lower):
        return "Sí"  # Gelatina en polvo viene en sobres
        
    # Búsqueda de palabras clave
    for keyword in flexible_keywords:
        if keyword in name_lower:
            return "Sí"
            
    for keyword in rigid_keywords:
        if keyword in name_lower:
            return "No"
        
    return "Indeterminado"

def is_flexible_packaging(image_path_or_url, name="", brand=""):
    """Combina OCR, análisis de contornos y análisis de nombre para determinar si el empaque es flexible"""
    # 1. Primero intentamos con OCR (si la imagen está disponible)
    if os.path.exists(image_path_or_url) or image_path_or_url.startswith("http"):
        ocr_result = is_flexible_by_ocr(image_path_or_url)
        print(f"Resultado OCR: {ocr_result}")
        if ocr_result in ["Sí", "No"]:
            return ocr_result
    
    # 2. Si OCR no fue concluyente, intentamos con análisis de contornos
    if os.path.exists(image_path_or_url) or image_path_or_url.startswith("http"):
        contour_result = is_flexible_by_contours(image_path_or_url)
        print(f"Resultado contornos: {contour_result}")
        if contour_result not in ["Error", None]:
            return contour_result
    
    # 3. Si todo lo demás falla, usamos la heurística basada en nombre
    name_result = is_flexible_by_name(name, brand)
    print(f"Resultado por nombre: {name_result}")
    return name_result

# Este bloque solo se ejecutará si el script se ejecuta directamente,
# no cuando se importa como módulo
if __name__ == "__main__":
    # Leer el CSV existente
    csv_path = os.path.join(IMG_DIR, "productos.csv")
    products = []

    with open(csv_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            products.append(row)

    print(f"Procesando {len(products)} productos para determinar si sus empaques son flexibles...")

    # Procesar cada producto
    for i, product in enumerate(products):
        image_url = product.get("image_url", "")
        name = product.get("name", "")
        brand = product.get("brand", "")
        
        if image_url:
            print(f"\nProcesando producto {i+1}/{len(products)}: {name}")
            product["is_flexible"] = is_flexible_packaging(image_url, name, brand)
            print(f"Resultado final: {product['is_flexible']}")
        else:
            product["is_flexible"] = "Desconocido"

    # Guardar el CSV actualizado
    with open(csv_path, mode="w", newline="", encoding="utf-8") as file:
        fieldnames = ["category", "name", "brand", "image_url", "is_flexible"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for product in products:
            writer.writerow(product)

    print(f"\n¡Proceso completado! Se ha actualizado {csv_path} con la información de empaques flexibles.")