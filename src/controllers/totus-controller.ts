import { Request, Response, Next } from 'restify';
import fs from "fs";
import path from "path";

import { scrapeAllProducts } from '../services/scraper.totus'
import {generateCsv,generateJson} from '../utils/fileUtils'

export let scrapedData: any[] = [];
export const totusScrapePage = async (req: Request, res: Response, next: Next) => {

    try {
        const { apiKey } = req.query; // ⬅️ Recibir la URL desde la query
        let url = "https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa"
        if (!url) {
            return res.send(400, {
                error: "Falta la URL en la query. Ejemplo: /start-scraping?url=https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa"
            });
        }

        if (!apiKey) {
            return res.send(400, {
                error: "falta api key"
            });
        }

        console.log(`🚀 Iniciando scraping en: ${url}`);

        const data = await scrapeAllProducts(url, apiKey);
        scrapedData = data;
        console.log("✅ Enviando respuesta al cliente...");
        res.send(200, data);
        //localStorage.setItem(data:data});
    } catch (error) {
        console.error("❌ Error en el scraping:", error);
        res.send(500, { error: (error as Error).message });
    }
    return next();
};



// Controlador mejorado para descargar JSON
export const downloadJson = async (req: Request, res: Response, next: () => void) => {
    try {
        if (scrapedData.length === 0) {
            console.log("❌ No hay datos para descargar.");
            res.send(400, { error: "No hay datos para descargar" });
            return next();
        }

        // Asegurarnos de que el directorio existe
        const downloadsDir = path.join(__dirname, "../../downloads");
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const filePath = path.join(downloadsDir, "products.json");
        generateJson(scrapedData, filePath);

        // Cargar el archivo en memoria
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Configurar cabeceras
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=products.json");
        res.setHeader("Content-Length", Buffer.byteLength(fileContent));
        
        // Enviar el contenido directamente
        res.send(200, fileContent);
        console.log("✅ JSON enviado correctamente");
        return next();
        
    } catch (error) {
        console.error("❌ Error al generar JSON:", error);
        res.send(500, { error: "Error al generar JSON" });
        return next();
    }
};

// controlador para descargar CSV
export const downloadCsv = async (req: Request, res: Response, next: () => void) => {
    try {
        if (scrapedData.length === 0) {
            console.log("❌ No hay datos para descargar.");
            res.send(400, { error: "No hay datos para descargar" });
            return next();
        }

        // Asegurarnos de que el directorio existe (usando encoding UTF-8)
        const downloadsDir = path.join(__dirname, "../../downloads");
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const filePath = path.join(downloadsDir, "products.csv");
        generateCsv(scrapedData, filePath);
        
        res.writeHead(200, {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=products.csv"
        });
        // Leer el archivo y enviarlo como stream
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

          // Manejar errores del stream
          fileStream.on('error', (err) => {
            console.error("Error en el stream:", err);
            if (!res.headersSent) {
                res.send(500, { error: "Error al leer el archivo" });
            }
            return next();
        });
        fileStream.pipe(res);
        
    } catch (error) {
        console.error("❌ Error al generar CSV:", error);
        res.send(500, { error: "Error al generar CSV" });
        return next();
    }
};
