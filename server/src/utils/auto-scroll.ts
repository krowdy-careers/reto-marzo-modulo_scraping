import { Page } from 'puppeteer';

export class AutoScroller {
  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - 1000) {
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });
  }
}