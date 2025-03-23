import { Request, Response } from "express";
import { getItemsTottus } from "../services/tottusService";
import { classifyProducts } from "../services/classifyProducts";
import fs from "fs/promises";

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

export const classify = async (req: Request, res: Response): Promise<void> => {
  try {
    let fileExists = false;
    try {
      await fs.access("productos.json");
      fileExists = true;
    } catch (err) {
      console.error("Error al verificar la existencia del archivo:", err);
    }

    if (!fileExists) {
      res.status(400).json({ success: false, error: "Primero debes ejecutar el scraping." });
      return;
    }
    // const baseUrl = "https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa"; 
    // const products = await getItemsTottus(baseUrl);      // para scrapear y luego analizar
    const rawData = await fs.readFile("productos.json", "utf-8");
    const products = JSON.parse(rawData);
    console.log("📸 Clasificando productos...");
    const classifiedProducts = await classifyProducts(products, 500); // se limito a 500 productos

    res.status(200).json({ success: true, data: classifiedProducts });
  } catch (error) {
    console.error("Error en el endpoint:", error);
    res.status(500).json({ success: false, error: "Error al procesar los productos" });
  }
};