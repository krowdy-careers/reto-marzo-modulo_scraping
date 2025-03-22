
import { clasificarEmpaque } from './analize.image.ai';
import { cluster, initCluster } from '../config/cluster';
import { getTotalPages } from "../utils/next.page";

//import fetch from 'node-fetch';

interface Product {
  categoria: string;
  subcategoria: string;
  name: string;
  marca: string;
  imagenUrl: string;
  empaqueFlexible?: boolean | string;
}


export async function scrapeProductsTotus(baseUrl: string): Promise<Product[]> {


  console.log("🟢 Iniciando scrapeProductsTotus...");
  if (!cluster) {
    console.log("🟡 Clúster no inicializado. Inicializando...");
    await initCluster();
  }

  let products: Product[] = [];
  //let card_product = "div.jsx-1068418086.search-results-4-grid.grid-pod"
 let card_product = 'div[pod-layout="4_GRID"]';
  
/*
  let p = document.querySelectorAll(card_product);
  let image_url=p[0].children[0].children[0].children[0].children[0].children[0].children[1].getAttribute("src");
  let brand=p[0].children[0].children[1].children[0].children[0].textContent;
  let name_product=p[0].children[0].children[1].children[0].children[1].textContent;
  */

  //congigurar la tarea para el cluster
   await cluster.task(async ({ page, data: url }) => {
    try {
   
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );
    console.log(`🔎 Abriendo página: ${url}`);


  
      await page.goto(url, { waitUntil: "domcontentloaded" ,timeout:90000});
      // Verificar si realmente se cargó la página
      const pageUrl = page.url();
      console.log(`📄 URL actual en Puppeteer: ${pageUrl}`);
      if (pageUrl === 'about:blank') {
          throw new Error("❌ La página no se cargó correctamente.");
      }

      console.log("🔄 Haciendo scroll para cargar productos...");
      await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
      });
      await page.waitForSelector(card_product,{timeout:5000});
      const count = await page.evaluate(() => document.querySelectorAll('div[pod-layout="4_GRID"]').length);
      console.log(`Total de productos encontrados en la página: ${count}`);

      const items = await page.$$eval(card_product, elements =>
        elements.map(el => {
          const subcategoria = "buscando"//el.querySelector('.subcategoria')?.textContent?.trim() || 'none';
          const name = el.children?.[0]?.children?.[1]?.children?.[0]?.children?.[1]?.textContent?.trim() || 'none';
          const marca = el.children?.[0]?.children?.[1]?.children?.[0]?.children?.[0]?.textContent?.trim() || '';
          const imagenUrl = el.querySelector('img')?.getAttribute("src")||'none';
      
          return { categoria: 'Despensa', subcategoria, name, marca, imagenUrl };
        })
      );

      // for (const item of items) {
      //const empaqueFlexible = await clasificarEmpaque(item.imagenUrl);
      // products.push({ ...item, empaqueFlexible });
      //  }
      console.log(`items  ${JSON.stringify(items,null,2)}`);
      products.push(...items);
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
