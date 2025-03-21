import * as restify from 'restify';
import { totusScrapePage } from '../controllers/totus-controller';

export const scrapingRoutes = (server: any) => {
    // Servir el HTML correctamente cuando se accede a /scraper
    server.get('/scraper', (req: any, res: { setHeader: (arg0: string, arg1: string) => void; sendRaw: (arg0: any) => void; }, next: () => any) => {
        res.setHeader('Content-Type', 'text/html');
        res.sendRaw(require('fs').readFileSync('./dist/static/index.html'));
        return next();
    });

    // Endpoint para iniciar el scraping
    server.get('/start-scraping', totusScrapePage);
};
