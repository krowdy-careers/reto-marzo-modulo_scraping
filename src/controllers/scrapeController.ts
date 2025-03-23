 import { Request, Response } from "express";
import { getItemsTottus } from "../services/tottusService";
import { processProducts } from "../services/processProducts";

export const scrape = async (req: Request, res: Response) => {
  try {
   
    const url = "https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa";
    console.log("🌍 Scrapeando URL:", url);
    const data = await getItemsTottus(url);
    console.log("✅ Datos extraídos:", data.length);
    res.status(200).json({ success: true, data });  
  } catch (error) {
    console.error("❌ Error en scraping:", error);
    res.status(500).json({ success: false, error: "Error en scraping" });
  }
};

export const scrapeAndClassify = async (req: Request, res: Response) => {
  try {
    const baseUrl = "https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa";
    const products = await getItemsTottus(baseUrl);
    const classifiedProducts = await processProducts(10);
    res.status(200).json({ success: true, data: classifiedProducts });  
  } catch (error) {
    console.error("Error en el endpoint:", error);
    res.status(500).json({ success: false, error: "Error al procesar los productos" });
  }
};