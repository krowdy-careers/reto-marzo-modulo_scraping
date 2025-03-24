const os = require('os');
const path = require('path');

// Configuración para el scraper
const SCRAPER_CONFIG = {
  url: 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa',
  headless: false,
  outputFile: 'tottus_products.csv',
  outputJson: 'tottus_products.json',
  waitTimeout: 30000,
  maxWorkers: Math.max(1, Math.min(os.cpus().length - 1, 4)), // Limita a núcleos disponibles - 1 (máx 4)
  pagesPerWorker: 5, // Cuántas páginas procesa cada worker
  maxDetailPageWorkers: 5, // Máximo de workers para páginas de detalle
  detailPageTimeout: 15000, // Timeout para páginas de detalle
  fetchDetailPages: true // Habilitar/deshabilitar extracción de páginas de detalle
};

// Configuración para el analizador de imágenes
const IMAGE_CONFIG = {
  tempImageDir: path.join(__dirname, '..', '..', 'temp_images'),
  ollamaEndpoint: 'http://localhost:11434/api/generate',
  ollamaApiBase: 'http://localhost:11434',
  model: 'deepseek-r1:latest',
  maxConcurrentAnalyses: 2,
  outputFile: 'tottus_products_analyzed.csv',
  useOllama: true,
  imageAnalysisEnabled: true,
  allowPartialModelMatch: true
};

module.exports = {
  SCRAPER_CONFIG,
  IMAGE_CONFIG
};
