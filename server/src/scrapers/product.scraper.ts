// src/scrapers/product.scraper.ts
import { Page } from 'puppeteer';
import { Product } from '../models/product.model';

export class ProductScraper {
  static async extractProducts(page: Page): Promise<Product[]> {
    await page.waitForSelector('.jsx-1068418086.search-results-2-grid.grid-pod');

    return await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(".jsx-1068418086.search-results-2-grid.grid-pod")
      ).map(element => ({
        name: element.querySelector(".jsx-4014752167.copy5.primary.jsx-3451706699.normal.line-clamp.line-clamp-3.pod-subTitle.subTitle-rebrand")?.textContent?.trim() || "Sin nombre",
        price: element.querySelector(".copy10.primary.medium.jsx-3451706699.normal.line-height-22")?.textContent?.trim() || "N/A",
        image: element.querySelector('img')?.getAttribute('src') || "Sin imagen",
        marca: element.querySelector(".pod-title")?.textContent?.trim() || "N/A",
        empaqueFlexible: 'Pendiente'
      }));
    });
  }
}