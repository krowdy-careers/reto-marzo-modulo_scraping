
/*
let b= document.querySelector("div.jsx-2929192365.pods-container") // for obtaien button of categories

b?.children[0].children[0].click():
let t=document.getElementById("testId-CategoryTitle-container") // div -for category adn subcategory

t?.children[0].textContent
t?.children[1]?.textContent
*/
import { cluster, initCluster } from "../config/cluster";

export async function getSubcategoryUrls(baseUrl: string): Promise<string[]> {
  console.log("🟢 Iniciando getSubcategoryUrls...");
  if (!cluster) {
    console.log("🟡 Clúster no inicializado. Inicializando...");
    await initCluster();
  }

  const subcategoryUrls: string[] = [];

  await cluster.task(async ({ page }) => {
    try {
      console.log(`🔎 Abriendo página principal: ${baseUrl}`);
      await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
      
      // Esperar a que los botones de subcategoría estén disponibles
      await page.waitForSelector("div.jsx-2929192365.pods-container > div > button", { 
        timeout: 10000 
      });

      // Obtener todos los botones de subcategorías
      const buttonCount = await page.$$eval(
        "div.jsx-2929192365.pods-container > div > button", 
        (elements) => elements.length
      );
      
      console.log(`🔢 Total de botones de subcategorías encontrados: ${buttonCount}`);

      // Recorrer cada botón, hacer clic y obtener la URL
      for (let i = 0; i < buttonCount; i++) {
        // Volver a navegar a la página principal para asegurar un estado consistente
        if (i > 0) {
          await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
          await page.waitForSelector("div.jsx-2929192365.pods-container > div > button", { 
            timeout: 10000 
          });
        }
        
        console.log(`🖱️ Clic en botón ${i + 1}`);
        
        // Hacer clic en el botón usando evaluate para asegurar que se ejecuta en el contexto del navegador
        await page.evaluate((index) => {
          const buttons = document.querySelectorAll("div.jsx-2929192365.pods-container > div > button");
          if (buttons[index]) {
            (buttons[index] as HTMLElement).click();
          }
        }, i);
        
        // Esperar a que la navegación se complete
        try {
          await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 });
        } catch (err) {
          console.log(`⚠️ Tiempo de espera excedido para navegación del botón ${i + 1}, continuando...`);
        }
        
        // Obtener la URL actualizada
        const newUrl = page.url();
        if (newUrl !== baseUrl && !subcategoryUrls.includes(newUrl)) {
          console.log(`🌍 Subcategoría encontrada: ${newUrl}`);
          subcategoryUrls.push(newUrl);
        } else {
          console.log(`⚠️ No se detectó cambio de URL para el botón ${i + 1}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error durante el scraping de subcategorías: ${err}`);
    }
  });

  // Ejecutar la tarea
  await cluster.queue(baseUrl);
  await cluster.idle();

  console.log(`✅ Subcategorías obtenidas: ${subcategoryUrls.length}`);
  return subcategoryUrls;
}

