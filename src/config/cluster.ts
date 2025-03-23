import { Cluster } from "puppeteer-cluster";
import StealhPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";

puppeteer.use(StealhPlugin());

export const initCluster = async (): Promise<Cluster> => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
    puppeteerOptions: {
      headless: false,
      args: [
        "--no-sandbox",
        "--start-maximized",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
      timeout: 90000,
      defaultViewport: null,
    },
  });

  console.log(" Cluster initialized 🎉");

  return cluster;
};