
import { clasificarEmpaque } from './analize.image.ai';
import { cluster, initCluster } from '../config/cluster';
import { getTotalPages } from "../utils/next.page";
import { Product } from '../models/product';





export async function scrapeProductsTotus(baseUrl: string,apiKey:string): Promise<Product[]> {


  console.log("🟢 Iniciando scrapeProductsTotus...");
  if (!cluster) {
    console.log("🟡 Clúster no inicializado. Inicializando...");
    await initCluster();
  }

  let products: Product[] = [];
  
  // this is the main  atribute for all products 
  let card_product = 'div[pod-layout="4_GRID"]';


  //config  taks for cluster
  await cluster.task(async ({ page, data: url }) => {
    try {

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      );
      console.log(`🔎 Open page : ${url}`);


           // Config  aditional headers for avoid  detection bots
           await page.setExtraHTTPHeaders({
            'Accept-Language': 'es-ES,es;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Referer': 'https://tottus.falabella.com.pe/'
          });
          
    
      await page.goto(url, { waitUntil: ["domcontentloaded","networkidle2"], timeout: 90000 });

      // verify is really page loaded
      const pageUrl = page.url();
      console.log(`📄 Current URL  on Puppeteer: ${pageUrl}`);
      if (pageUrl === 'about:blank') {
        throw new Error("❌ the page not load correctly.");
      }
      //Verify if have a ref to main page of Totus
        if (pageUrl === 'https://tottus.falabella.com.pe/tottus-pe') {
        console.log("⚠️ Detectada redirección a página principal. Intentando bypass...");
        
        // Intentar navegar de nuevo con un enfoque diferente
        const cleanUrl = url.split('?')[0]; // Quitar parámetros que pueden causar problemas
        await page.goto(cleanUrl, { 
          waitUntil: ["domcontentloaded", "networkidle2"], 
          timeout: 90000 
        });
        
        // Verificar si la redirección persiste
        const newPageUrl = page.url();
        if (newPageUrl === 'https://tottus.falabella.com.pe/tottus-pe') {
          throw new Error("❌ No se pudo acceder a la página de categoría (posible bloqueo anti-bot)");
        }
      }
      
      // Esperar un momento para que la página se estabilice
      

      console.log("🔄 Haciendo scroll para cargar productos...");
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitForSelector(card_product, { timeout: 5000 });
      await page.waitForSelector('img',{timeout:2000})
      const count = await page.evaluate(() => document.querySelectorAll('div[pod-layout="4_GRID"]').length);
      console.log(`Total de productos encontrados en la página: ${count}`);

      
      
       const items = await page.$$eval(card_product, elements =>
        elements.map(el => {
          const categoria=document.getElementById("testId-CategoryTitle-container")?.children[0].textContent||"none";
          const subcategoria =document.getElementById("testId-CategoryTitle-container")?.children[1].textContent ||"none";
          const name = el.children?.[0]?.children?.[1]?.children?.[0]?.children?.[1]?.textContent?.trim() || 'none';
          const marca = el.children?.[0]?.children?.[1]?.children?.[0]?.children?.[0]?.textContent?.trim() || '';
          const imagenUrl = el.querySelector('img')?.getAttribute("src") || 'none';
          const empaqueFlexible= "api key no worked";
          
          return { categoria, subcategoria, name, marca, imagenUrl ,empaqueFlexible};
        })
      );

      for (const item of items) {
      const empaqueFlexible = await clasificarEmpaque(item.imagenUrl,item.name,apiKey);
      products.push({ ...item, empaqueFlexible });
      }
      console.log(`items  ${JSON.stringify(items, null, 2)}`);
     
    } catch (err) {
      console.log(err);
    }
  });


  // Obtener el número total de páginas
  console.log("🔍 Obteniendo número total de páginas...");
  let totalPages = 1;
  try {

    totalPages = await getTotalPages(baseUrl);


    console.log(`📊 Total de páginas encontradas: ${totalPages}`);
  } catch (error) {
    console.error("❌ Error al obtener el total de páginas:", error);
    console.log("⚠️ Continuando con valor predeterminado de 1 página");
  }

  // Encolar todas las páginas para procesamiento paralelo
  console.log(`🔄 Encolando ${totalPages} páginas para procesamiento...`);
  const pagePromises = [];
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const url = `${baseUrl}?page=${pageNum}`;
    console.log(`📋 Encolando página ${pageNum}/${totalPages}: ${url}`);
    pagePromises.push(cluster.queue(url));
  }

  // Esperar a que todas las páginas sean procesadas
  console.log("⏳ Esperando que termine el scraping de todas las páginas...");
  await Promise.all(pagePromises);
  await cluster.idle();
  await cluster.close();

  console.log(`✅ Scraping completado. Total de productos obtenidos: ${products.length}`);
  return products;

}
