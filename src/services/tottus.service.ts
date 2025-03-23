
import { cluster } from '../config/cluster';
import { exec } from 'child_process';


interface Product {
  SubCategoria: string;
  Nombre: string;
  Categoria: string;
  Marca: string;
  Imagen: string;
  EsFlexible?: string;
}


// Función para llamar al script Python que analiza la imagen con OpenCV
function analizarImagen(urlImagen: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`python detectar_empaque.py "${urlImagen}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error: ${error.message}`);
      }
      if (stderr) {
        return reject(`Stderr: ${stderr}`);
      }
      resolve(stdout.trim());
    });
  });
}

export class TottusService {


  // Función para obtener el número total de páginas y retornar la ultima
  static async getLastPage(url: string): Promise<number> {
    return await cluster.execute(url, async ({ page, data }) => {
      
      await page.goto(data, { waitUntil: 'domcontentloaded', timeout: 90000 });
      
      const lastPage: string = await page.evaluate(() => {
       
          const items = [...document.querySelectorAll('.pagination-item')].map(el => {
          const number = el.querySelector(".pagination-button-mkp")?.innerHTML || '';
          return number;
        });
       
        return items[items.length - 1];
      });
      return Number(lastPage);
    });
  }


  static async getItemsbyURL(url: string): Promise<Product[]> {
    return await cluster.execute(url, async ({ page, data }) => {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      );

      console.log('cargo');
      await page.goto(data, {
        waitUntil: 'domcontentloaded',
        timeout: 90000
      });

      // Realiza scroll incremental para cargar imágenes y evitar que el campo imagen de como resultado vacio
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100; 
          const delay = 100;    
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, delay);
        });
      });

      const html = await page.content();
      console.log("✅ HTML guardado en 'pagina.html'");

      // Extraer los productos
      let info: Product[] = await page.evaluate(() => {
        const products = [...document.querySelectorAll('.pod')].map((el) => {
          const Categoria = "Despensa";
          const SubCategoria = el.querySelector('.l2category')?.innerHTML || 'Sin SubCategoria';
          const Nombre = el.querySelector('.pod-subTitle')?.innerHTML || '';
          const Marca = el.querySelector('.pod-title')?.innerHTML || '';
          const Imagen = el.querySelector('img')?.getAttribute('src') || '';

          return {
            Categoria,
            SubCategoria,
            Nombre,
            Marca,
            Imagen
          };
        });
        return products;
      });

            
      // Analizar cada imagen usando el script Python
      for (const product of info) {
        if (product.Imagen) {
          try {
            const resultado = await analizarImagen(product.Imagen);
            product.EsFlexible = resultado; // "Flexible" o "No Flexible"
          } catch (error) {
            product.EsFlexible = `Error: ${error}`;
          }
        } else {
          product.EsFlexible = "Sin imagen";
        }
      }
      console.log(info);
      return info;
    });
  }
}
