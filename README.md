### **Instrucciones**
1. Instalar librerías
```
npm install
```
2. Transpilar el código a Javascript
```
npm run build
```
3. Arrancar el servidor
```
npm run serve
```
### **Definir variables de entorno**
- Crear un archivo `.env` en la raíz del proyecto.
```
# Puerto, por defecto 8080 si no se especifíca
PORT=8080

# API Key para poder utilizar el servicio de análisis de producto mediante OpenAI Visión
OPENAI_API_KEY="api_key"
```
### **Como utilizar**
- Para scrapear productos, los guarda en un archivo `data.json` en la raíz del proyecto.
```
localhost:8080/scrape-tottus
```
- Para verificar si el empaque de un producto es flexible o no.
```
localhost:8080/openai?imageUrl="url-de-la-imagen-a-analizar"
```
