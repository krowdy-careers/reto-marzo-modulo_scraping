import { Cluster } from 'puppeteer-cluster';

export let cluster: Cluster; // Definimos `cluster` fuera de la función para poder exportarlo
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export const initCluster = async () => {
    cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 5,
        puppeteer,
        timeout: 120000,
        puppeteerOptions: {
            headless: false,
            args: ['--no-sandbox',
                '--start-maximized',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
              ],
            timeout: 90000,
            defaultViewport: null
        },
    });
};
