import puppeteer, { Browser, Page } from 'puppeteer';
import { SelectorBuilder } from '../../utils/selector-builder.js';
import { ProductDto } from '../../product/dto/product.dto.js';
import { ProductoService } from '../../product/service/product.service.js';

export class ScraperService {
  private browser: Browser;
  private productService: ProductoService;

  private baseUrl =
    'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa';

  constructor(browser: Browser, productService: ProductoService) {
    this.browser = browser;
    this.productService = productService;
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

  private async getProductSubcategory(
    page: Page,
    productUrl: string,
  ): Promise<string> {
    await page.goto(productUrl);

    return this.getPageCategory(page);
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
  ): Promise<ProductDto[]> {
    const pageUrl = `${this.baseUrl}?page=${pageNumber}`;
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
        name: element.querySelector('.subTitle-rebrand')?.textContent || '',
        brand: element.querySelector('.title-rebrand')?.textContent || '',
        image: element.querySelector('img')?.getAttribute('src') || '',
      }));
    });

    const products: ProductDto[] = [];
    const detailsPage = await this.browser.newPage();

    for (const [index, productUrl] of productUrls.entries()) {
      try {
        const rawProduct = rawProducts[index];
        const subcategory = await this.getProductSubcategory(
          detailsPage,
          productUrl,
        );

        const product = await this.productService.processProduct(
          category,
          subcategory,
          rawProduct,
        );

        products.push(product);
        console.log(products[products.length - 1]);
      } catch (error) {
        console.error('Error obteniendo detalles:', error);
      }
    }

    detailsPage.close();
    return products;
  }

  private async getProductsFromCategory(page: Page): Promise<ProductDto[]> {
    const totalPages = await this.getTotalPages(page);
    const products: ProductDto[] = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      console.log(`Scraping página ${pageNumber} de ${totalPages}...`);

      const category = await this.getPageCategory(page);

      try {
        const productsFromPage = await this.getProductsFromPage(
          page,
          pageNumber,
          category,
        );
        products.push(...productsFromPage);
      } catch (error) {
        console.error(`Error scraping página ${pageNumber}:`, error);
      }
    }

    return products;
  }

  async execute(): Promise<void> {
    this.browser = await puppeteer.launch();

    console.log('Iniciando scraping...');
    try {
      const pageMain = await this.browser.newPage();
      await pageMain.goto(this.baseUrl);

      const allProducts = await this.getProductsFromCategory(pageMain);

      console.log(`Total de productos extraídos: ${allProducts.length}`);
    } catch (error) {
      console.error('Error durante la ejecución del scraping:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      console.log('Scraping finalizado.');
    }
  }
}
