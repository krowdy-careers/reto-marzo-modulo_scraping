import { Page } from 'puppeteer';

export class Paginator {
  static async getTotalPages(page: Page): Promise<number> {
    return await page.evaluate(() => {
      const lastButton = document.querySelector('li.pagination-item:last-child button');
      return lastButton ? parseInt(lastButton.textContent || '1') : 1;
    });
  }

  static async goToNextPage(page: Page, currentPage: number): Promise<boolean> {
    const nextPageButton = await page.$(`#testId-pagination-bottom-button${currentPage + 1}`);
    if (nextPageButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        nextPageButton.click(),
      ]);
      return true;
    }
    return false;
  }
}