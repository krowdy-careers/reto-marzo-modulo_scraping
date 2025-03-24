
import { totusScrapePage } from '../controllers/totus-controller';
import { downloadCsv,downloadJson } from '../controllers/totus-controller';
import { Request, Response, Next } from 'restify';
import fs from "fs";
import path from "path";
export const scrapingRoutes = (server: any) => {
    // Servir el HTML correctamente cuando se accede a /scraper
    server.get('/scraper', (req: any, res: { setHeader: (arg0: string, arg1: string) => void; sendRaw: (arg0: any) => void; }, next: () => any) => {
        res.setHeader('Content-Type', 'text/html');
        res.sendRaw(require('fs').readFileSync('./dist/static/index.html'));
        return next();
    });


    // O de manera más sencilla con una ruta específica para el CSS
server.get('/style.css', (req:Request, res:Response, next:Next) => {
    const cssPath = path.join(__dirname, '../static/style.css');
    res.writeHead(200, {
      'Content-Type': 'text/css'
    });
    require('fs').createReadStream(cssPath).pipe(res);
    return next(false); // Indica que no hay más manejadores
  });
    // Endpoint para iniciar el scraping
    server.get('/start-scraping', totusScrapePage);
    // endpoint for donwload JSON
    server.get("/download-json", downloadJson);
    // endpont for donwload CSV
    server.get("/download-csv", downloadCsv);
};
