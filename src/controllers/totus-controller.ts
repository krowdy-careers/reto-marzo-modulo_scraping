import { Request, Response, Next } from 'restify';
import { scrapeProductsTotus } from '../services/scraper';
export const totusScrapePage = async (req: Request, res: Response, next: Next) => {
   
    try {
        const { url } = req.query; // ⬅️ Recibir la URL desde la query

        if (!url) {
            return res.send(400, {
                error: "Falta la URL en la query. Ejemplo: /start-scraping?url=https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa"
            });
        }

        console.log(`🚀 Iniciando scraping en: ${url}`);

        const data = await scrapeProductsTotus(url);

        console.log("✅ Enviando respuesta al cliente...");
        res.send(200, data);
    } catch (error) {
        console.error("❌ Error en el scraping:", error);
        res.send(500, { error: (error as Error).message });
    }
    return next();
};