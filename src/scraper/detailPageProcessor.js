const puppeteer = require('puppeteer');

/**
 * Extrae la subcategoría de una página de detalle
 * @param {Object} page Página de Puppeteer
 * @param {string} url URL de la página de detalle
 * @param {number} timeout Tiempo máximo de espera
 * @returns {Promise<string|null>} Subcategoría encontrada o null
 */
async function extractSubcategoryFromDetailPage(page, url, timeout) {
  try {
    console.log(`🔍 Visitando página de detalle: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: timeout 
    });
    
    // Esperar a que la tabla de especificaciones aparezca
    try {
      await page.waitForSelector('table.specification-table', { 
        timeout: 10000 
      });
    } catch (e) {
      console.log('⚠️ No se encontró tabla de especificaciones');
      return null;
    }

    // Extraer información de la tabla de especificaciones
    const subcategory = await page.evaluate(() => {
      // Buscar filas que contengan "Tipo" en la primera columna
      const rows = Array.from(document.querySelectorAll('table.specification-table tr'));
      
      for (const row of rows) {
        const propertyName = row.querySelector('td:first-child')?.innerText.trim().toLowerCase();
        
        // Buscar cualquier propiedad que contenga la palabra "tipo"
        if (propertyName && propertyName.includes('tipo')) {
          const propertyValue = row.querySelector('td:last-child')?.innerText.trim();
          if (propertyValue) {
            return propertyValue;
          }
        }
      }
      
      // Si no encontramos nada con "tipo", buscar otras categorías comunes
      for (const row of rows) {
        const propertyName = row.querySelector('td:first-child')?.innerText.trim().toLowerCase();
        if (propertyName && 
            (propertyName.includes('categoría') || 
             propertyName.includes('categoria') || 
             propertyName.includes('familia') || 
             propertyName.includes('clase'))) {
          const propertyValue = row.querySelector('td:last-child')?.innerText.trim();
          if (propertyValue) {
            return propertyValue;
          }
        }
      }
      
      return null; // Si no encontramos nada relevante
    });
    
    console.log(`📋 Subcategoría extraída: ${subcategory || 'No encontrada'}`);
    return subcategory;
  } catch (error) {
    console.error(`❌ Error extrayendo subcategoría: ${error.message}`);
    return null;
  }
}

/**
 * Procesa lotes de páginas de detalle en paralelo
 * @param {Array} detailUrls Array de objetos {url, index}
 * @param {number} workerId ID del worker
 * @param {Object} config Configuración
 * @returns {Promise<Array>} Resultados con subcategorías encontradas
 */
async function processDetailPages(detailUrls, workerId, config) {
  console.log(`🔄 Worker de detalles ${workerId}: Iniciando procesamiento de ${detailUrls.length} páginas`);
  
  const browser = await puppeteer.launch({ 
    headless: config.headless, 
    args: ['--no-sandbox'] 
  });
  
  const page = await browser.newPage();
  const results = [];
  
  // Configurar timeouts más cortos para páginas de detalle
  page.setDefaultTimeout(config.detailPageTimeout);
  page.setDefaultNavigationTimeout(config.detailPageTimeout);
  
  for (const { url, index } of detailUrls) {
    try {
      const subcategory = await extractSubcategoryFromDetailPage(
        page, 
        url, 
        config.detailPageTimeout
      );
      results.push({ index, subcategory });
    } catch (error) {
      console.error(`❌ Worker de detalles ${workerId}: Error procesando ${url}: ${error.message}`);
      results.push({ index, subcategory: null });
    }
  }
  
  await browser.close();
  return results;
}

module.exports = {
  extractSubcategoryFromDetailPage,
  processDetailPages
};
