const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path'); // ✅ Solo una vez
const vision = require('@google-cloud/vision'); // ✅ Solo una vez
const csvWriter = require('csv-writer').createObjectCsvWriter;

// Cargar variables desde .env
require('dotenv').config();

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

// URL base de Tottus
const URL_BASE = 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa';

// Función para extraer los productos de una página
async function scrapePage(page) {
  try {
    await page.waitForSelector('.pod.pod-2_GRID.pod-link', { timeout: 5000 }); // Esperar productos
  } catch (error) {
    console.error('⚠️ No se encontraron productos en la página.');
    return [];
  }

  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.pod.pod-2_GRID.pod-link')).map(el => ({
      categoria: 'Despensa', // Asumimos que todos son de Despensa
      subcategoria: el.closest('.section')?.querySelector('.section-title')?.innerText.trim() || 'Sin subcategoría',
      nombre: el.querySelector('.pod-subTitle')?.innerText.trim() || 'Sin nombre',
      marca: el.querySelector('.pod-title')?.innerText.trim() || 'Sin marca',
      precio: el.querySelector('.prices-0 span')?.innerText.trim() || 'Sin precio',
      imagen: el.querySelector('picture img')?.getAttribute('src') || 'Sin imagen',
      enlace: el.getAttribute('href') || 'Sin enlace'
    }));
  });
}

// Función para verificar si el empaque es flexible con Google Vision
async function isFlexible(imageUrl) {
  if (imageUrl === 'Sin imagen' || !imageUrl.startsWith('http')) {
    return 'No aplica'; // Si no hay imagen, no analiza
  }

  try {
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations.map(label => label.description.toLowerCase());
    return labels.includes('plastic') || labels.includes('flexible') ? 'Sí' : 'No';
  } catch (error) {
    console.error('❌ Error en Google Vision:', error);
    return 'Error';
  }
}

// Guardar en JSON
function saveToJSON(products) {
  if (products.length === 0) {
    console.error('❌ No hay productos para guardar en JSON.');
    return;
  }

  fs.writeFileSync('productos.json', JSON.stringify(products, null, 2), 'utf-8');
  console.log('✅ Archivo JSON guardado.');
}

// Guardar en CSV
async function saveToCSV(products) {
  if (products.length === 0) {
    console.error('❌ No hay productos para guardar en CSV.');
    return;
  }

  const writer = csvWriter({
    path: 'productos.csv',
    header: [
      { id: 'categoria', title: 'Categoría' },
      { id: 'subcategoria', title: 'Subcategoría' },
      { id: 'nombre', title: 'Nombre' },
      { id: 'marca', title: 'Marca' },
      { id: 'precio', title: 'Precio' },
      { id: 'imagen', title: 'Imagen (URL)' },
      { id: 'enlace', title: 'Enlace' },
      { id: 'flexible', title: 'Es flexible' }
    ]
  });

  await writer.writeRecords(products);
  console.log('✅ Archivo CSV guardado.');
}

// Función principal para hacer scraping en múltiples páginas
async function scrapeTottus() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let currentPage = 1;
  let allProducts = [];

  while (true) {
    const url = `${URL_BASE}?page=${currentPage}`;
    console.log(`🌍 Navegando a: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    const products = await scrapePage(page);

    if (products.length === 0) {
      console.log(`❌ Fin del scraping: No se encontraron más productos en la página ${currentPage}`);
      break;
    }

    for (let product of products) {
      product.flexible = await isFlexible(product.imagen);
      allProducts.push(product);
    }

    console.log(`✅ Página ${currentPage} procesada. Productos extraídos: ${products.length}`);
    currentPage++;
  }

  await browser.close();

  console.log(`🔹 Total de productos extraídos: ${allProducts.length}`);

  // Guardar en archivos
  saveToJSON(allProducts);
  await saveToCSV(allProducts);

  console.log('🚀 Scraping finalizado.');
}

// Ejecutar el scraper
scrapeTottus();
