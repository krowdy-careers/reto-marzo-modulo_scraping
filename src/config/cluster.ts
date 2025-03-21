import { Cluster } from "puppeteer-cluster";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";

puppeteer.use(StealthPlugin());

class PuppeteerCluster {

  static async launchCluster() {
    return await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 3,
      puppeteer,
      timeout: 500000,
      puppeteerOptions: {
        headless: false,
        args: [
          "--no-sandbox",
          // "--start-maximized",
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process",
        ],
        timeout: 400000,
        defaultViewport: null,
      },
    });
  }
}

export default PuppeteerCluster;
