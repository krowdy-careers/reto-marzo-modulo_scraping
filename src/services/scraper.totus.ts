// Ahora modificar `scrapeProductsTotus` para usar `getSubcategoryUrls`

import {scrapeProductsTotus} from './scraper.subcategory'
import {getSubcategoryUrls} from '../services/savvy'
import { Product } from '../models/product';
import {initCluster,cluster} from '../config/cluster'
 export async function scrapeAllProducts(baseUrl:string, apikey:string) {
  
  
  
  
    // Inicializar el cluster una sola vez
    if (!cluster) {
      console.log("🟡 Inicializando cluster...");
      await initCluster();
    }
    
    //Fist of all obtained all ulrs of subcategories 
     /*
     * like: aceites, harinas , etc ...
     */
    console.log("📂 Obteniendo URLs de subcategorías...");
    const subcategoryUrls = await getSubcategoryUrls(baseUrl);
    console.log(`📊 Se encontraron ${subcategoryUrls.length} subcategorías para procesar`);
    
    
    if (subcategoryUrls.length === 0) {
      console.log("❌ Sub categorie sno found. Now start scraping  main category Despensa...");
      return await scrapeProductsTotus(baseUrl, apikey);
    }
    
    
    
    //Then  scraping each subcategory
    const allProducts: Product[] = [];
    for (const url of subcategoryUrls) {
        const products = await scrapeProductsTotus(url,apikey);
        allProducts.push(...products);
    }

    console.log(`✅ Scraping finished. Total of products obtained: ${allProducts.length}`);
    return allProducts;
}