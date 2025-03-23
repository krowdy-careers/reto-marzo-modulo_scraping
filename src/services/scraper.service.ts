import { Page } from "puppeteer";
import { scrollPageToBottom, scrollPageToTop } from "puppeteer-autoscroll-down";

import PuppeteerCluster from "../config/cluster";

/**
 * List of product categories to scrape
 */
const categoryList = [
  "Aceites",
  "Conservas y enlatados",
  "Arroz, legumbres y semillas",
  "Pastas y salsas",
  "Harinas",
  "Vinagres, aderezos y condimentos",
  "Instantáneos y sopas",
  "Azúcar y endulzantes",
];

/**
 * Represents a single product scraped from the website
 */
type Product = {
  brand: string;
  name: string;
  category: string;
  subCategory: string;
  priceValue: string | number;
  image: string;
};

class ScraperService {
  /**
   * Scrapes product data from a single page
   * @param {Page} page The Puppeteer page instance
   * @returns {Promise<Product[]>} A promise that resolves with an array of scraped products
   */
  private static async scrapeSinglePage(page: Page): Promise<Product[]> {
    await page.waitForSelector(".pod-group--products", { visible: true });

    // Quickly goes to bottom before it starts to load images from bot to top
    await scrollPageToBottom(page, { size: 1500, delay: 50 });
    await scrollPageToTop(page, { size: 200, delay: 150 });

    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));

    return await page.evaluate((): Product[] => {
      return [...document.querySelectorAll(".pod")].map((el): Product => {
        const brand = el.querySelector(".pod-title")?.textContent!.trim() || "";
        const name = el.querySelector(".pod-subTitle")?.textContent!.trim() || "";
        const category = "Despensa";
        const subCategory = document.querySelector(".l2category")?.textContent!.trim() || "";
        const image = el.querySelector("img")?.getAttribute("src") || "";
        const price = el.querySelector(".prices-0");
        const priceValue =
          (price?.getAttribute("data-internet-price") ??
            price?.getAttribute("data-cmr-price")) ||
          "";

        return {
          brand,
          name,
          category,
          subCategory,
          priceValue,
          image,
        };
      });
    });

  }
  /**
   * Scrapes all products from a specific category, handling pagination.
   * @param {Page} page The Puppeteer page instance
   * @param {string} categoryName The category name to scrape
   * @returns {Promise<Product[]>} A promise that resolves with an array of scraped products
   */
  private static async getItemsByCategory(page: Page, categoryName: string): Promise<Product[]> {
    let values: Product[] = [];

    // Clicks the category based on it's text content
    await page.evaluate((category: string) => {
      const h3Arr = Array.from(document.querySelectorAll("h3"));
      const target = h3Arr.find((el) => el.textContent?.trim() === category);

      target?.click();
    }, categoryName);

    await page.waitForSelector(".pagination");

    // Get last page from pagination
    const lastPage = await page.evaluate(() => {
      const pagination = document.querySelectorAll("#testId-searchResults-actionBar-bottom .pagination ol li");

      if (pagination.length > 1) {
        return Number(
          document.querySelector(".pagination ol li:last-child button")
            ?.textContent,
        );
      }

      return 1;
    });

    const pageUrl = page.url();
    for (let currentPage = 1; currentPage <= lastPage; currentPage++) {
      try {
        await page.goto(`${pageUrl}&page=${currentPage}`);
        const productsOnPage = await this.scrapeSinglePage(page);

        values = values.concat(productsOnPage);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }

    return values;
  }

  /**
   * Scrapes all items across multiple categories using Puppeteer Cluster
   * @param {string} url The base url of the website
   * @returns {Promise<Product[]>} A promise that resolves with an array of all scraped products
   */
  static async getAllItems(url: string): Promise<Product[]> {
    const browser = await PuppeteerCluster.launchCluster();
    let productsData: Product[][] = [];

    categoryList.forEach((category: string) => {
      browser.queue({ category });
    })

    await browser.task(async ({ page, data }) => {
      await page.goto(url);

      productsData.push(
        await this.getItemsByCategory(page, data.category),
      );
    });

    await browser.idle();
    await browser.close();

    // Flatten the array before returning
    return productsData.flat();
  }
}

export default ScraperService;
