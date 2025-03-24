import { Request, Response, Next } from 'restify';
import { ScreenshotService } from '../services/screenshot.service';
import { TottusService } from '../services/tottus.service';

export const screenshotController = async (req: Request, res: Response, next: Next) => {
    const url = req.query.url;
    console.log(url)
    if (!url) {
        res.send(400, { error: 'URL is required' });
        return next();
    }

    try {
        const screenshot = await ScreenshotService.capture(url);
        res.setHeader('Content-Type', 'image/png');
        res.writeHead(200);

        // Envía la imagen directamente
        res.end(screenshot);
    } catch (error) {
        res.send(500, { error: (error as Error).message });
    }
    return next();
};


export const screenshotControllerJS = async (req: Request, res: Response, next: Next) => {
    const url = req.query.url;
    console.log(url)
    if (!url) {
        res.send(400, { error: 'URL is required' });
        return next();
    }

    try {
        const screenshot = await ScreenshotService.captureJS(url);
        res.send(200, { screenshot: `data:image/png;base64,${screenshot}` });;
    } catch (error) {
        res.send(500, { error: (error as Error).message });
    }
    return next();
};


export const tottusScrapePage = async (req: Request, res: Response, next: Next) => {
    const page = req.query.page;
    console.log(page)
    if (!page) {
        res.send(400, { error: 'Page is required' });
        return next();
    }

    try {
        const data = await Promise.all([TottusService.getItemsbyURL(`https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa?subdomain=tottus&page=1&store=tottus`),
        TottusService.getItemsbyURL(`https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa?subdomain=tottus&page=2&store=tottus`),
        TottusService.getItemsbyURL(`https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa?subdomain=tottus&page=3&store=tottus`),
        ]);
        res.send(200, data);;
    } catch (error) {
        console.log(error)
        res.send(500, { error: (error as Error).message });
    }
    return next();
};