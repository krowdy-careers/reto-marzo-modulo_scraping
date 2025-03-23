// Ahora modificar `scrapeProductsTotus` para usar `getSubcategoryUrls`

import {scrapeProductsTotus} from './scraper.subcategory'
import {getSubcategoryUrls} from '../services/savvy'
import { Product } from '../models/product';
import {initCluster,cluster} from '../config/cluster'
 export async function scrapeAllProducts(baseUrl:string) {console.log("🚀 Iniciando proceso completo de scraping...");
  
    // Inicializar el cluster una sola vez
    if (!cluster) {
      console.log("🟡 Inicializando cluster...");
      await initCluster();
    }
    
    // Primero obtenemos todas las URLs de subcategorías
    console.log("📂 Obteniendo URLs de subcategorías...");
    const subcategoryUrls = await getSubcategoryUrls(baseUrl);
    console.log(`📊 Se encontraron ${subcategoryUrls.length} subcategorías para procesar`);
    
    // Verificación extra de las URLs obtenidas
    if (subcategoryUrls.length === 0) {
      console.log("❌ No se encontraron subcategorías. Verificando categoría principal...");
      return await scrapeProductsTotus(baseUrl);
    }
    
    // Luego hacemos scraping de cada subcategoría
    

    const allProducts: Product[] = [];
    for (const url of subcategoryUrls) {
        const products = await scrapeProductsTotus(url);
        allProducts.push(...products);
    }

    console.log(`✅ Scraping finalizado. Total de productos obtenidos: ${allProducts.length}`);
    return allProducts;
}