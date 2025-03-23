
import sys
import cv2
import numpy as np
import requests

def analizar_empaque(url):
    try:
        # Descargar la imagen desde la URL
        response = requests.get(url, timeout=10)
        image_array = np.frombuffer(response.content, np.uint8)
        
        imagen = cv2.imdecode(image_array, cv2.IMREAD_GRAYSCALE)
        if imagen is None:
            return "Error: No se pudo decodificar la imagen"
        
        bordes = cv2.Canny(imagen, 100, 200)
        cantidad_bordes = np.sum(bordes > 0)

        if cantidad_bordes < 5000:
            return "Flexible"
        else:
            return "No Flexible"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: URL de imagen no proporcionada")
    else:
        url = sys.argv[1]
        resultado = analizar_empaque(url)
        print(resultado)
