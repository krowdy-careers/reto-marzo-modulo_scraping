const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const { downloadImage } = require('./imageDownloader');
const { analyzePackaging } = require('./packagingAnalyzer');
const { ensureDirectoryExists, cleanDirectory } = require('../utils/fileUtils');
const { checkOllamaStatus } = require('../utils/ollamaUtils');
const { IMAGE_CONFIG } = require('../config/config');

/**
 * Procesa un lote de productos
 * @param {Array} batch Lote de productos para analizar
 * @param {Object} config Configuración
 * @returns {Promise<Array>} Productos con análisis de empaque agregado
 */
async function processBatch(batch, config) {
  const results = [];
  
  for (const product of batch) {
    const productName = product.Nombre || 'Producto sin nombre';
    console.log(`🖼️ Analizando empaque de: ${productName}`);
    
    // Crear un ID único basado en el nombre del producto
    const productId = (productName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Descargar la imagen
    const imagePath = await downloadImage(product['Imagen (URL)'], productId, config.tempImageDir);
    
    // Analizar el empaque usando exclusivamente DeepSeek
    const packagingType = await analyzePackaging(imagePath, productName, config);
    console.log(`📦 Empaque determinado: ${packagingType} para ${productName}`);
    
    // Agregar el análisis al producto
    results.push({
      ...product,
      empaqueFlexible: packagingType
    });
    
    // Eliminar la imagen temporal
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  
  return results;
}

/**
 * Procesa el CSV de productos y agrega análisis de empaque
 * @param {string} csvFilePath Ruta al archivo CSV de entrada
 * @param {Object} customConfig Configuración personalizada (opcional)
 * @returns {Promise<void>}
 */
async function analyzeProductImages(csvFilePath, customConfig = {}) {
  // Combinar la configuración predeterminada con la personalizada
  const config = { ...IMAGE_CONFIG, ...customConfig };
  
  console.log('🔍 Iniciando análisis de empaques con DeepSeek...');
  
  // Verificar si podemos usar Ollama para el análisis de imágenes
  const ollamaStatus = await checkOllamaStatus(config);
  if (!ollamaStatus) {
    console.error('❌ DeepSeek no está disponible. No se puede realizar el análisis visual.');
    return;
  }
  
  // Asegurar que el directorio temporal existe
  ensureDirectoryExists(config.tempImageDir);
  
  // Limpiar el directorio temporal
  cleanDirectory(config.tempImageDir);
  
  // Leer el archivo CSV
  const products = [];
  await new Promise((resolve) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => products.push(data))
      .on('end', resolve);
  });
  
  console.log(`📊 Total de productos a analizar: ${products.length}`);
  
  // Procesar los productos en lotes pequeños para mejor control
  const batchSize = config.maxConcurrentAnalyses;
  const analyzedProducts = [];
  const totalProducts = products.length;
  const totalBatches = Math.ceil(totalProducts / batchSize);
  
  for (let i = 0; i < totalProducts; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`⏳ Procesando lote ${Math.floor(i / batchSize) + 1}/${totalBatches}...`);
    
    const batchResults = await processBatch(batch, config);
    analyzedProducts.push(...batchResults);
    
    // Mostrar progreso
    console.log(`✅ Progreso: ${Math.min(i + batchSize, totalProducts)}/${totalProducts} productos analizados`);
  }
  
  // Estadísticas de resultados
  const flexibleCount = analyzedProducts.filter(p => p.empaqueFlexible === 'Flexible').length;
  const rigidCount = analyzedProducts.filter(p => p.empaqueFlexible === 'Rígido').length;
  const undeterminedCount = analyzedProducts.filter(p => p.empaqueFlexible === 'No determinado').length;
  
  console.log('\n📊 Estadísticas del análisis:');
  console.log(`- Empaques Flexibles: ${flexibleCount} (${(flexibleCount/analyzedProducts.length*100).toFixed(1)}%)`);
  console.log(`- Empaques Rígidos: ${rigidCount} (${(rigidCount/analyzedProducts.length*100).toFixed(1)}%)`);
  console.log(`- No determinados: ${undeterminedCount} (${(undeterminedCount/analyzedProducts.length*100).toFixed(1)}%)`);
  
  // Guardar resultados en un nuevo CSV
  const outputPath = path.join(path.dirname(csvFilePath), config.outputFile);
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'Categoría', title: 'Categoría' },
      { id: 'Subcategoría', title: 'Subcategoría' },
      { id: 'Nombre', title: 'Nombre' },
      { id: 'Marca', title: 'Marca' },
      { id: 'Imagen (URL)', title: 'Imagen (URL)' },
      { id: 'Precio', title: 'Precio' },
      { id: 'Enlace', title: 'Enlace' },
      { id: 'empaqueFlexible', title: 'Tipo de Empaque' },
    ],
  });
  
  await csvWriter.writeRecords(analyzedProducts);
  console.log(`✅ Análisis completado. Resultados guardados en ${config.outputFile}`);
}

module.exports = {
  analyzeProductImages
};
