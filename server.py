import os
import csv
import requests
import cv2
import numpy as np
import re
from PIL import Image
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS

# Importamos las funciones de scraper.py
from scraper import extract_text_from_image, is_flexible_by_ocr, is_flexible_by_contours, HEADERS

# Directorio para guardar imágenes
IMG_DIR = "images"
os.makedirs(IMG_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app)

def download_image(image_url):
    """Descarga la imagen con cabeceras mejoradas para evitar bloqueos"""
    try:
        response = requests.get(image_url, headers=HEADERS, stream=True)
        if response.status_code == 200:
            filename = image_url.split("/")[-1].split("?")[0]
            img_path = os.path.join(IMG_DIR, filename)
            with open(img_path, "wb") as f:
                f.write(response.content)
            print(f"Imagen descargada con éxito: {img_path}")
            return img_path
        else:
            print(f"Error al descargar imagen (status: {response.status_code}): {image_url}")
            return None
    except Exception as e:
        print(f"Error al descargar imagen {image_url}: {e}")
        return None

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
    """Enfoque híbrido: OCR + análisis de contornos + análisis de nombre"""
    result = None
    
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

@app.route('/process_images', methods=['POST'])
def process_images():
    data = request.json
    products = data.get("products", [])
    csv_file = "productos.csv"
    
    with open(csv_file, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Categoría", "Nombre", "Marca", "Imagen", "Es Flexible"])
        
        for i, product in enumerate(products):
            category = product.get("category", "Desconocido")
            name = product.get("name", "Desconocido")
            brand = product.get("brand", "Desconocido")
            image_url = product.get("image_url", "")
            
            print(f"\nProcesando producto {i+1}/{len(products)}: {name}")
            
            if not image_url:
                writer.writerow([category, name, brand, "", "Indeterminado"])
                continue
                
            # Intentar descargar la imagen
            local_image = download_image(image_url)
            
            # Determinar si es flexible (con imagen local o URL según disponibilidad)
            if local_image:
                is_flex = is_flexible_packaging(local_image, name, brand)
            else:
                # Si no se pudo descargar, intentamos directamente con la URL o nombre
                is_flex = is_flexible_packaging(image_url, name, brand)
                
            writer.writerow([category, name, brand, image_url, is_flex])
            print(f"Resultado final para '{name}': {is_flex}")
    
    return jsonify({
        "message": f"Datos procesados y guardados en {csv_file}",
        "status": "success",
        "products_processed": len(products)
    }), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)