import { Cluster } from "puppeteer-cluster";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export interface PuppeteerCluster extends Cluster<any, any> {}

let clusterInstance: PuppeteerCluster;

export async function initCluster(): Promise<void> {
  clusterInstance = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    puppeteer,
    puppeteerOptions: {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
      defaultViewport: {
        width: 1366,
        height: 768,
      },
    },
    timeout: 180000,
    monitor: false,
  });

  console.log("Cluster inicializado correctamente");

  clusterInstance.on("taskerror", (err, data) => {
    console.error(`Error en tarea para ${data}: ${err.message}`);
  });

  return;
}

export const cluster = {
  execute: async <T>(
    url: string,
    task: (data: { page: any; data: string }) => Promise<T>
  ): Promise<T> => {
    if (!clusterInstance) {
      throw new Error(
        "Cluster no inicializado. Llama a initCluster() primero."
      );
    }
    return await clusterInstance.execute(url, task);
  },
  close: async (): Promise<void> => {
    if (clusterInstance) {
      await clusterInstance.close();
    }
  },
};
