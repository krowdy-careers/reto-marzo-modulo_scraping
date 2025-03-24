import { Browser, Page } from 'puppeteer';
import { SelectorBuilder } from '../../utils/selector-builder.js';
import { ProductDto } from '../../product/dto/product.dto.js';
import { ProductoService } from '../../product/service/product.service.js';
import { RawProductDto } from '../../product/dto/raw-product.dto.js';

export class ScraperService {
  private browser: Browser;
  private productService: ProductoService;

  private baseUrl = process.env.BASE_URL || '';

  constructor(browser: Browser, productService: ProductoService) {
    this.browser = browser;
    this.productService = productService;
  }

  async setPageDetails(): Promise<Page> {
    const pageDetails = await this.browser.newPage();
    await pageDetails.setRequestInterception(true);
    pageDetails.on('request', (req) => {
      if (
        req.resourceType() === 'stylesheet' ||
        req.resourceType() === 'font' ||
        req.resourceType() === 'media' ||
        req.resourceType() === 'script'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });
    return pageDetails;
  }

  async resetPage(page: Page): Promise<void> {
    await page.goto('about:blank');
  }

  private async getPageCategory(page: Page): Promise<string> {
    const selector = new SelectorBuilder('[data-testid=breadcrumbs]')
      .descendant('li:last-child')
      .build();

    await page.waitForSelector(selector);
    return await page.$eval(selector, (element) => {
      return element.textContent || '';
    });
  }

  private async getProductDetails(
    page: Page,
    productUrl: string,
  ): Promise<[string, string]> {
    await this.resetPage(page);
    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

    const subcategory = await this.getPageCategory(page);

    const selector = new SelectorBuilder('.headline-wrapper')
      .descendant('img')
      .build();

    const imageUrl = await page.$eval(
      selector,
      (element) => element.getAttribute('src')?.trim() || '',
    );

    return [subcategory, imageUrl];
  }

  private async getTotalPages(page: Page): Promise<number> {
    const selector = new SelectorBuilder('.pagination')
      .descendant('li:last-child')
      .child('button')
      .build();

    const pageNumber = await page.$eval(
      selector,
      (element) => element.textContent?.trim() || '1',
    );

    return parseInt(pageNumber);
  }

  private async getProductsFromPage(
    page: Page,
    pageNumber: number,
    category: string,
    pageDetails: Page,
  ): Promise<ProductDto[]> {
    const pageUrl = `${this.baseUrl}?page=${pageNumber}`;
    await this.resetPage(page);
    await page.goto(pageUrl);

    const selector = new SelectorBuilder('.search-results--products')
      .descendant('a')
      .build();

    await page.waitForSelector(selector);

    const productUrls = await page.$$eval(selector, (elements) => {
      return elements.map((element) => element.getAttribute('href') || '');
    });

    const rawProducts = await page.$$eval(selector, (elements) => {
      return elements.map((element) => ({
        name:
          element.querySelector('.subTitle-rebrand')?.textContent?.trim() || '',
        brand:
          element.querySelector('.title-rebrand')?.textContent?.trim() || '',
      }));
    });

    const products: ProductDto[] = [];

    for (const [index, productUrl] of productUrls.entries()) {
      try {
        const rawProduct = rawProducts[index];
        const [subcategory, imageUrl] = await this.getProductDetails(
          pageDetails,
          productUrl,
        );

        const product = await this.productService.processProduct(
          category,
          subcategory,
          { ...rawProduct, imageUrl } as RawProductDto,
        );

        products.push(product);
        console.log(product);
      } catch (error) {
        console.error('Error obteniendo detalles:', error);
      }
    }
    return products;
  }

  public async getProductsFromCategory(page: Page): Promise<ProductDto[]> {
    const pageDetails = await this.setPageDetails();
    await page.bringToFront();

    await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded' });
    const totalPages = await this.getTotalPages(page);
    const products: ProductDto[] = [];
    const category = await this.getPageCategory(page);

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      console.log(`Scraping página ${pageNumber} de ${totalPages}...`);

      try {
        const productsFromPage = await this.getProductsFromPage(
          page,
          pageNumber,
          category,
          pageDetails,
        );
        products.push(...productsFromPage);
      } catch (error) {
        console.error(`Error scraping página ${pageNumber}:`, error);
      }
    }
    await pageDetails.close();

    return products;
  }
}
