import {cluster} from '../config/cluster'
import puppeteer, { Page } from "puppeteer";

export async function getTotalPages(baseUrl: string): Promise<number> {
  console.log("🔍 Obteniendo número total de páginas...");
  let totalPages = 1;
  
  try {
    // Usar el método execute del cluster para obtener un navegador y página
    totalPages = await cluster.execute(async ({ page }:{page:Page
      
    }) => {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      );
      
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      
      // Ejecutar la lógica de paginación en el contexto del navegador
      return await page.evaluate(() => {
        try {
          // Método 1: Intentar obtener el último número de página desde la navegación
          const paginationSelector = "ol.jsx-1389196899.jsx-2796234256";
          const paginationElement = document.querySelector(paginationSelector);
          
          if (paginationElement && paginationElement.children.length > 0) {
            const lastPageElement = paginationElement?.children[4]?.textContent;
            const lastPageNumber = Number(lastPageElement);
            
            if (!isNaN(lastPageNumber) && lastPageNumber > 0) {
              return lastPageNumber;
            }
          }
          
          // Método 2: Calcular basado en el número total de resultados y elementos por página
          const searchResultsElement = document.getElementById("search_numResults");
          if (searchResultsElement && searchResultsElement.textContent) {
            const resultsText = searchResultsElement.textContent.trim();
            const matches = resultsText.match(/(\d+)-(\d+) de (\d+)/);
            
            if (matches && matches.length >= 4) {
              const totalResults = parseInt(matches[3], 10);
              const itemsPerPage = parseInt(matches[2], 10) - parseInt(matches[1], 10) + 1;
              
              if (!isNaN(totalResults) && !isNaN(itemsPerPage) && itemsPerPage > 0) {
                return Math.ceil(totalResults / itemsPerPage);
              }
            } else {
              const parts = searchResultsElement.textContent.split(" ");
              if (parts.length >= 5) {
                const totalResults = parseInt(parts[4], 10);
                const itemsPerPage = parseInt(parts[2], 10);
                
                if (!isNaN(totalResults) && !isNaN(itemsPerPage) && itemsPerPage > 0) {
                  return Math.ceil(totalResults / itemsPerPage);
                }
              }
            }
          }
          
          return 1;
        } catch (error) {
          console.error("Error al obtener el total de páginas:", error);
          return 1;
        }
      });
    });
    
    console.log(`📊 Total de páginas encontradas: ${totalPages}`);
    return totalPages;
  } catch (error) {
    console.error("❌ Error al obtener el total de páginas:", error);
    console.log("⚠️ Continuando con valor predeterminado de 1 página");
    return 1;
  }
}