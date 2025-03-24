const { Cluster } = require("puppeteer-cluster");

class ScraperService {
  constructor() {
    this.cluster = null;
  }

  async initialize() {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_BROWSER,
      maxConcurrency: 3,
      puppeteerOptions: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--window-size=1920,1080",
        ],
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      },
    });

    this.cluster.on("taskerror", (err, data) => {
      console.error(`Error crawling ${data}: ${err.message}`);
    });
  }

  async scrape(url, callback) {
    if (!this.cluster) {
      await this.initialize();
    }

    return this.cluster.execute(url, callback);
  }

  async close() {
    if (this.cluster) {
      await this.cluster.idle();
      await this.cluster.close();
    }
  }
}

module.exports = new ScraperService();
