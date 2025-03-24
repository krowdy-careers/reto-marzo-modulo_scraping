const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

/**
 * Guarda un array de productos en formato JSON
 * @param {Array} products Array de productos
 * @param {string} outputFile Nombre del archivo de salida
 * @param {string} baseDir Directorio base donde se guardará el archivo
 */
function saveToJson(products, outputFile, baseDir = __dirname) {
  console.log(`💾 Guardando ${products.length} productos en JSON...`);
  fs.writeFileSync(
    path.join(baseDir, outputFile), 
    JSON.stringify(products, null, 2), 
    'utf-8'
  );
  console.log(`✅ Datos guardados en ${outputFile}`);
}

/**
 * Guarda un array de productos en formato CSV
 * @param {Array} products Array de productos
 * @param {string} outputFile Nombre del archivo de salida
 * @param {Array} header Definición de cabeceras para el CSV
 * @param {string} baseDir Directorio base donde se guardará el archivo
 */
async function saveToCsv(products, outputFile, header, baseDir = __dirname) {
  console.log(`💾 Guardando ${products.length} productos en CSV...`);
  const csvWriter = createObjectCsvWriter({
    path: path.join(baseDir, outputFile),
    header
  });

  await csvWriter.writeRecords(products);
  console.log(`✅ Datos guardados en ${outputFile}`);
}

/**
 * Asegura que un directorio existe, creándolo si es necesario
 * @param {string} dirPath Ruta del directorio
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Directorio creado: ${dirPath}`);
  }
}

/**
 * Limpia todos los archivos en un directorio
 * @param {string} dirPath Ruta del directorio
 */
function cleanDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        fs.unlinkSync(path.join(dirPath, file));
      }
      console.log(`🧹 Directorio limpiado: ${dirPath}`);
    }
  } catch (error) {
    console.error('❌ Error al limpiar directorio:', error);
  }
}

module.exports = {
  saveToJson,
  saveToCsv,
  ensureDirectoryExists,
  cleanDirectory
};
