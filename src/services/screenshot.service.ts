import { cluster } from '../config/cluster';

export class ScreenshotService {
    static async capture(url: string): Promise<string> {
        return await cluster.execute(url, async ({ page, data }) => {
            await page.goto(data, { waitUntil: 'networkidle2' });
            return await page.screenshot();
        });
    }
    static async captureJS(url: string): Promise<string> {
        return await cluster.execute(url, async ({ page, data }) => {
            page.setDefaultNavigationTimeout(0);
            await page.goto(data, { waitUntil: 'networkidle2' });
            return await page.screenshot({ encoding: 'base64' });
        });
    }
}


