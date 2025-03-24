import { Request, Response } from "restify";
import { TotusService } from "../services/totus.service";
import { MAX_PAGES, TARGET_URL } from "../config/constants";

export const totusScrapePage = async (req: Request, res: Response) => {
  try {
    const baseUrl = (req.query.url as string) || TARGET_URL;

    const maxPages = req.query.maxPages
      ? parseInt(req.query.maxPages as string, 10)
      : MAX_PAGES;

    if (isNaN(maxPages as number) && req.query.maxPages) {
      res.send(400, {
        success: false,
        error: "El parámetro 'maxPages' debe ser un número válido",
      });
      return;
    }

    console.log(
      `Iniciando scraping para: ${baseUrl}${
        maxPages ? ` (máximo ${maxPages} páginas)` : ""
      }`
    );

    const productos = await TotusService.getProductsByUrl(baseUrl, maxPages);

    res.send(200, {
      success: true,
      totalProductos: productos.length,
      productos: productos,
      fecha: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error al obtener los productos:", error);
    res.send(500, {
      success: false,
      error: "Error al obtener los productos",
      mensaje: error.message,
    });
  }
};
