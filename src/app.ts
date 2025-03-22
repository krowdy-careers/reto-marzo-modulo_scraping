import puppeteer from 'puppeteer';
import { ProductoService } from './product/service/product.service.js';
import { ScraperService } from './scraper/service/scraper.service.js';

async function main() {
  try {
    const browser = await puppeteer.launch();
    const productoService = new ProductoService();
    const scraperService = new ScraperService(browser, productoService);

    console.log('🚀 Iniciando scraping...');
    await scraperService.execute();
    console.log('✅ Proceso completado con éxito');
  } catch (error) {
    console.error('❌ Error en la ejecución:', error);
    process.exit(1);
  }
}

main();
