const puppeteer = require('puppeteer');
const path = require('path');
const { SCRAPER_CONFIG } = require('../config/config');
const { saveToJson, saveToCsv } = require('../utils/fileUtils');
const { autoScroll, extractProductsFromPage, getTotalPages } = require('./pageExtractor');
const { processDetailPages } = require('./detailPageProcessor');

/**
 * Procesa un rango específico de páginas
 * @param {number} startPage Página inicial
 * @param {number} endPage Página final
 * @param {number} workerId ID del worker
 * @param {Object} config Configuración
 * @returns {Promise<Array>} Productos extraídos
 */
async function scrapePageRange(startPage, endPage, workerId, config) {
  console.log(`🔄 Worker ${workerId}: Iniciando scraping de páginas ${startPage} a ${endPage}`);
  
  const browser = await puppeteer.launch({ 
    headless: config.headless, 
    args: ['--no-sandbox'] 
  });
  
  const page = await browser.newPage();
  const products = [];
  
  try {
    for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
      const url = `${config.url}?page=${currentPage}`;
      console.log(`🔍 Worker ${workerId}: Procesando página ${currentPage}...`);
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Esperar el contenedor de productos
      try {
        await page.waitForSelector('.jsx-2420634928.search-results--products', { timeout: config.waitTimeout });
      } catch (error) {
        console.log(`⚠️ Worker ${workerId}: No se encontró el contenedor de productos en página ${currentPage}`);
        break;
      }
      
      // Hacer scroll para cargar todas las imágenes
      await autoScroll(page);
      
      // Extraer productos
      const pageProducts = await extractProductsFromPage(page);
      
      // Verificar y limpiar los productos extraídos
      const cleanedProducts = pageProducts.map(product => {
        // Si la URL de la imagen contiene "cdn-cgi/imagedelivery" pero no tiene formato WebP,
        // intentar convertirla para asegurar que se cargue correctamente
        if (product.imageUrl && 
            product.imageUrl.includes('cdn-cgi/imagedelivery') && 
            !product.imageUrl.includes('format=webp')) {
          // Intentar añadir parámetros para formato WebP si no están presentes
          if (!product.imageUrl.includes('?')) {
            product.imageUrl += '?format=webp&quality=70';
          } else if (!product.imageUrl.includes('format=')) {
            product.imageUrl += '&format=webp&quality=70';
          }
        }
        return product;
      });
      
      if (cleanedProducts.length === 0) {
        console.log(`⚠️ Worker ${workerId}: No se encontraron productos en página ${currentPage}`);
        break;
      } else {
        products.push(...cleanedProducts);
        console.log(`✅ Worker ${workerId}: Encontrados ${cleanedProducts.length} productos en página ${currentPage}`);
      }
    }
  } catch (error) {
    console.error(`❌ Worker ${workerId}: Error:`, error);
  } finally {
    await browser.close();
    console.log(`🔒 Worker ${workerId}: Navegador cerrado.`);
  }
  
  return products;
}

/**
 * Función principal que coordina la paralelización del scraping
 * @param {Object} customConfig Configuración personalizada (opcional)
 * @returns {Promise<void>}
 */
async function scrapeProducts(customConfig = {}) {
  // Combinar la configuración predeterminada con la personalizada
  const config = { ...SCRAPER_CONFIG, ...customConfig };
  
  console.log(`🚀 Iniciando scraping con ${config.maxWorkers} workers en paralelo...`);
  
  // Iniciar navegador para determinar total de páginas
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox'] 
  });
  
  // Determinar el número total de páginas
  const totalPages = await getTotalPages(browser, config.url);
  
  // Cerrar el navegador inicial
  await browser.close();
  
  // Calcular cómo distribuir el trabajo
  const workers = [];
  for (let i = 0; i < config.maxWorkers && i * config.pagesPerWorker < totalPages; i++) {
    const startPage = i * config.pagesPerWorker + 1;
    const endPage = Math.min((i + 1) * config.pagesPerWorker, totalPages);
    workers.push(scrapePageRange(startPage, endPage, i + 1, config));
  }
  
  // Ejecutar todos los workers en paralelo
  console.log(`⏳ Ejecutando ${workers.length} workers en paralelo...`);
  const results = await Promise.all(workers);
  
  // Combinar los resultados
  const allProducts = results.flat();
  console.log(`🎉 ¡Scraping inicial completado! Total de productos encontrados: ${allProducts.length}`);
  
  // Extraer subcategorías de páginas de detalle si está habilitado
  if (config.fetchDetailPages && allProducts.length > 0) {
    console.log('🔍 Iniciando extracción de subcategorías desde páginas de detalle...');
    
    // Preparar lotes de URLs para procesar en paralelo
    const detailPageBatches = [];
    let currentBatch = [];
    let batchSize = Math.ceil(allProducts.length / config.maxDetailPageWorkers);
    
    // Crear lotes de URLs con su índice original
    allProducts.forEach((product, index) => {
      // Asegurarnos de que el enlace sea completo
      const link = product.link;
      if (link && link !== 'Sin enlace') {
        const fullUrl = link.startsWith('http') ? link : `https://tottus.falabella.com.pe${link}`;
        currentBatch.push({ url: fullUrl, index });
        
        if (currentBatch.length >= batchSize) {
          detailPageBatches.push([...currentBatch]);
          currentBatch = [];
        }
      }
    });
    
    // Añadir el último lote si tiene elementos
    if (currentBatch.length > 0) {
      detailPageBatches.push(currentBatch);
    }
    
    // Procesar los lotes en paralelo
    console.log(`⏳ Procesando ${detailPageBatches.length} lotes de páginas de detalle...`);
    const detailWorkers = detailPageBatches.map((batch, index) => 
      processDetailPages(batch, index + 1, config)
    );
    
    const detailResults = await Promise.all(detailWorkers);
    
    // Actualizar los productos con las subcategorías encontradas
    const subcategories = detailResults.flat();
    subcategories.forEach(({ index, subcategory }) => {
      if (subcategory && index < allProducts.length) {
        allProducts[index].subcategory = subcategory;
      }
    });
    
    console.log('✅ Extracción de subcategorías completada');
  }
  
  // Guardar los resultados
  if (allProducts.length > 0) {
    // Adaptar formato de productos para CSV
    const formattedProducts = allProducts.map(product => ({
      'Categoría': product.category,
      'Subcategoría': product.subcategory,
      'Nombre': product.name,
      'Marca': product.brand,
      'Imagen (URL)': product.imageUrl,
      'Precio': product.price,
      'Enlace': product.link
    }));
    
    // Guardar en JSON
    saveToJson(allProducts, config.outputJson, __dirname);
    
    // Guardar en CSV
    const csvHeader = [
      { id: 'Categoría', title: 'Categoría' },
      { id: 'Subcategoría', title: 'Subcategoría' },
      { id: 'Nombre', title: 'Nombre' },
      { id: 'Marca', title: 'Marca' },
      { id: 'Imagen (URL)', title: 'Imagen (URL)' },
      { id: 'Precio', title: 'Precio' },
      { id: 'Enlace', title: 'Enlace' },
    ];
    
    await saveToCsv(formattedProducts, config.outputFile, csvHeader, path.join(__dirname, '..', '..'));
  } else {
    console.log('⚠️ No se encontraron productos para guardar');
  }
  
  return {
    success: allProducts.length > 0,
    productsCount: allProducts.length,
    outputFile: config.outputFile
  };
}

module.exports = {
  scrapeProducts
};
