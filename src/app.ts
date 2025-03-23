import puppeteer from 'puppeteer';
import { ProductoService } from './product/service/product.service.js';
import { ScraperService } from './scraper/service/scraper.service.js';
import { CSVExporter } from './utils/csv-exporter.js';

async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: 'shell',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      defaultViewport: null,
      timeout: 60000,
    });
    const [page] = await browser.pages();
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      if (
        req.resourceType() === 'stylesheet' ||
        req.resourceType() === 'font' ||
        req.resourceType() === 'media' ||
        req.resourceType() === 'image'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const productoService = new ProductoService();
    const scraperService = new ScraperService(browser, productoService);

    console.log('Iniciando scraping...');
    const allProducts = await scraperService.getProductsFromCategory(page);
    console.log('Proceso completado con éxito');
    if (allProducts.length > 0) {
      const csvExporter = new CSVExporter();
      await csvExporter.exportarProductos(allProducts, 'products.csv');
      console.log('Productos exportados a productos.csv');
    } else {
      console.log('No se encontraron productos para exportar.');
    }
    await browser.close();
  } catch (error) {
    console.error('Error en la ejecución:', error);
    process.exit(1);
  }
}

main();
