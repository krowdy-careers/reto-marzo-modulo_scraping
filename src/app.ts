import puppeteer from 'puppeteer';
import { ProductoService } from './product/service/product.service.js';
import { ScraperService } from './scraper/service/scraper.service.js';
import { CSVExporter } from './utils/csv-exporter.js';
import { ERROR_MESSAGES } from './utils/messages.js';

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

    console.log('Initiating scraping...');
    const allProducts = await scraperService.getProductsFromCategory(page);

    if (allProducts.length > 0) {
      const csvExporter = new CSVExporter();
      await csvExporter.exportarProductos(
        allProducts,
        `${process.env.FILE_NAME}.csv`,
      );
    }

    console.log('Process completed');

    await browser.close();
  } catch (error) {
    console.error(ERROR_MESSAGES.executionError, error);
    process.exit(1);
  }
}

main();
