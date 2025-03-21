import { Page } from "puppeteer";
import { scrollPageToBottom, scrollPageToTop } from "puppeteer-autoscroll-down";

import PuppeteerCluster from "../config/cluster";

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

type Product = {
  brand: string;
  name: string;
  category: string;
  subCategory: string;
  priceValue: string | number;
  image: string;
};

class ScraperService {
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

  private static async getItemsByCategory(page: Page, categoryName: string): Promise<Product[]> {
    let values: Product[] = [];
    let lastPage = 1;

    await page.evaluate((category: string) => {
      const h3Arr = Array.from(document.querySelectorAll("h3"));
      const target = h3Arr.find((el) => el.textContent?.trim() === category);

      target?.click();
    }, categoryName);

    // await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    await page.waitForSelector(".pagination");
    lastPage = await page.evaluate(() => {
      const pagination = document.querySelectorAll("#testId-searchResults-actionBar-bottom .pagination ol li");

      if (pagination.length > 1) {
        return Number(
          document.querySelector(".pagination ol li:last-child button")
            ?.textContent,
        );
      }

      return 1;
    });

    let pageUrl = page.url();

    for (let currentPage = 1; currentPage <= lastPage; currentPage++) {
      await page.goto(`${pageUrl}&page=${currentPage}`);

      values = values.concat(await this.scrapeSinglePage(page));
    }

    return values;
  }

  static async getAllItems(url: string): Promise<Product[][]> {
    const browser = await PuppeteerCluster.launchCluster();
    let productsData: Product[][] = [];

    await browser.task(async ({ page, data }) => {
      await page.goto(url);

      productsData.push(
        await this.getItemsByCategory(page, data.category),
      );
    });

    categoryList.forEach(category => {
      browser.queue({ category });
    })
    // browser.queue({ category: "Vinagres, aderezos y condimentos"});

    await browser.idle();
    await browser.close();

    return productsData;
  }
}

export default ScraperService;
