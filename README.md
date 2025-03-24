# 🛒 Scraper de Productos Tottus

Este es un pequeño scraper que extrae información de productos desde la web de **Tottus**. Se ejecuta **desde la consola**, sin abrir ventanas ni interfaces gráficas, y permite obtener datos fácilmente mediante una API.

---

## ⚙️ Configuración

Antes de empezar, asegúrate de tener un archivo `.env` con la siguiente configuración:

```ini
PORT=3000  # Puerto donde se ejecuta el servidor
TARGET_URL=https://tottus.falabella.com.pe/tottus-pe/category/CATG14773/Quitamanchas-y-Blanqueadores-de-ropa  # URL de la categoría de productos a scrapear
MAX_PAGES=5  # Número máximo de páginas a scrapear
GEMINI_API_KEY=tu_api_key  # Clave de la API de Gemini
```

---

## 🚀 Cómo usarlo

El scraper se ejecuta en el puerto definido en `.env` y puedes hacer scraping de dos maneras:

### 1️⃣ Usando la configuración por defecto

Si no envías parámetros en la URL, el scraping se hará en la **URL definida en `.env`** con el número de páginas configurado.

- **Endpoint:**
  ```http
  GET http://localhost:3000/totusScrape
  ```

### 2️⃣ Definiendo manualmente la URL y el número de páginas

Si quieres scrapear otra URL o cambiar el número de páginas, puedes pasarlos como parámetros en la petición.

- **Endpoint:**
  ```http
  GET http://localhost:3000/totusScrape?url=<URL>&maxPages=<NÚMERO>
  ```
- **Ejemplo:**
  ```http
  GET http://localhost:3000/totusScrape?url=https://tottus.falabella.com.pe/tottus-pe/category/CATG14773/Quitamanchas-y-Blanqueadores-de-ropa&maxPages=3
  ```

---

## ⚠️ Limitaciones

- La **API de Gemini** permite analizar hasta **19 imágenes por minuto**. Si se excede este límite, algunos productos podrían no tener información.
- **No abre ventanas ni interfaces gráficas**, todo se ejecuta en la consola.
- Algunas páginas pueden tener protecciones anti-scraping que impidan obtener los datos.

---

## 📌 Requisitos

Para que todo funcione correctamente, asegúrate de tener instalado:

- **Node.js** y **npm**
- Un archivo `.env` correctamente configurado

---

## ▶️ Ejecución

### 1️⃣ Instalar dependencias

```bash
npm install
```

### 2️⃣ Iniciar el servidor

```bash
npm run dev
```

### 3️⃣ Realizar solicitudes GET

Puedes hacer scraping usando la configuración por defecto o definiendo manualmente la URL y el número de páginas.

---

## 📜 Nota

Este scraper fue creado con fines educativos y debe usarse **respetando los términos de servicio** del sitio web de Tottus.
