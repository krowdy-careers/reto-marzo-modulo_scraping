import {cluster} from '../config/cluster'
import  { Page } from "puppeteer";


//this function obtain number of pages each tab for subcategory
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
      
      
      return await page.evaluate(() => {
        try {
          // Method 1: try get the last number of page from navigation.
          const paginationSelector = "ol.jsx-1389196899.jsx-2796234256";
          const paginationElement = document.querySelector(paginationSelector);
          
          if (paginationElement && paginationElement.children.length > 0) {
            const lastPageElement = paginationElement?.children[4]?.textContent;
            const lastPageNumber = Number(lastPageElement);
            
            if (!isNaN(lastPageNumber) && lastPageNumber > 0) {
              return lastPageNumber;
            }
          }
          
          // Method 2: Compute relie  in total numbers of resulsts and elements per page
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
          console.error("Error obtained total pages:", error);
          return 1;
        }
      });
    });
    
    console.log(`📊 Total  pages found: ${totalPages}`);
    return totalPages;
  } catch (error) {
    console.error("❌ Error :", error);
    console.log("⚠️ Continue with default value 1");
    return 1;
  }
}