// src/services/tottus.service.ts
import { Product } from '../models/product.model';
import { BrowserManager } from '../utils/browser.manager';
import { Paginator } from '../utils/paginator';
import { AutoScroller } from '../utils/auto-scroll';
import { ProductScraper } from '../scrapers/product.scraper';
import { VisionService } from './vision.service';
import { Browser } from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

export class TottusService {
  private static readonly DATA_DIR = path.join(__dirname, '..', 'data');

  static async getItemsByURL(url: string): Promise<Product[]> {
    let browser:Browser | undefined;
    
    try {
      browser = await BrowserManager.getBrowser();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await AutoScroller.scrollToBottom(page);

      const totalPages = await Paginator.getTotalPages(page);
      const allProducts: Product[] = [];


      //modificar el 2 por totalPages
      for (let currentPage = 1; currentPage <= 2; currentPage++) {
        const products = await ProductScraper.extractProducts(page);
        allProducts.push(...products);
        //modificar el dos por totalPages
        if (currentPage < 2) {
          const success = await Paginator.goToNextPage(page, currentPage);
          if (success) await AutoScroller.scrollToBottom(page);
        }
      }

      // Analizar empaques
      const productsWithPackaging = await VisionService.analyzePackaging(allProducts);
      
      // Guardar datos
      await this.saveProductsToJson(productsWithPackaging);
      return productsWithPackaging;
    } finally {
      // Cerrar recursos 
      if (browser) {
        await browser.close();
        console.log('✅ Navegador cerrado');
      }
    }
  }

  private static async saveProductsToJson(products: Product[]): Promise<void> {
    try {
      await fs.mkdir(this.DATA_DIR, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.DATA_DIR, `productos-${timestamp}.json`);
      
      await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8');
      console.log(`✅ Datos guardados en: ${filePath}`);
    } catch (error) {
      console.error('❌ Error guardando JSON:', error);
    }
  }
}