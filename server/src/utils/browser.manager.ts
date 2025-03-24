import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';


export class BrowserManager {
  private static browserInstance: Browser;

  static async getBrowser(): Promise<Browser> {
    if (!this.browserInstance) {
      this.browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--blink-settings=imagesEnabled=false'
        ]
      });
    }
    return this.browserInstance;
  }

  static async closeBrowser() {
    if (this.browserInstance) {
      await this.browserInstance.close();
    }
  }
}