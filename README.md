*Assessment: Web Scraping de Productos de Despensa*

#  Scraping_module01

#  Descripcion del proyecto
+  Este proyecto es un web scraper desarrollado con Puppeteer en Node.js. Su objetivo es extraer información de los productos de la categoría "Despensa" en el sitio web de Tottus. El script recorre varias páginas de productos, extrae detalles clave como el nombre, marca e imagen, y los almacena en un archivo productos.json.

#  Tecnologias usadas
+  Node.JS
+  Puppeteer
+  FileSystem

# Estructura del proyecto

* reto-marzo-modulo_scraping
   -README.md
   -scraper.js


#  Instalacion y configuracion

+ Clonar el Repositorio
git clone https://github.com/tuusuario/reto-marzo-modulo_scraping.git
cd reto-marzo-modulo_scraping

#  Instalar dependencias

+  npm install

# Ejecutar Script

+ npm init -y #En este caso ejecutamos con "npm init -y" ya que es util en caso aun no tengamos y necesitemos de un package.json

#  Funcionamiento del Script

+ Se abre un navegador Chrome con puppeter que accede a la pagina de productos de la categoria "Despensa" de Tottus
+ Extrae informacion de cada producto:
   - nombre del producto
   - marca
   - imagen(URL)

+ Detecta y navega por la paginacion hasta recorrer todas las paginas
+ Guarda los datos extraidos en productos.json
+ Cierra el navegador una vez terminado el scraping.