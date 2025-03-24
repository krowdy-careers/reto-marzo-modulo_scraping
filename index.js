const path = require('path');
const { scrapeProducts } = require('./src/scraper');
const { analyzeProductImages } = require('./src/imageAnalysis');
const { SCRAPER_CONFIG } = require('./src/config/config');

/**
 * Función principal que coordina todo el proceso
 */
async function main() {
  console.log('🚀 Iniciando proceso completo de scraping y análisis...');
  
  try {
    // Paso 1: Ejecutar el scraper
    console.log('📋 Paso 1: Iniciando scraping de productos...');
    const scrapingResult = await scrapeProducts();
    
    if (!scrapingResult.success) {
      console.error('❌ El scraping no pudo encontrar productos. Proceso finalizado.');
      return;
    }
    
    // Paso 2: Analizar las imágenes
    console.log('🖼️ Paso 2: Iniciando análisis de imágenes...');
    const csvFilePath = path.join(__dirname, scrapingResult.outputFile);
    await analyzeProductImages(csvFilePath);
    
    console.log('✅ Proceso completo finalizado con éxito.');
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error);
  }
}

// Si este archivo se ejecuta directamente, iniciar el proceso
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
