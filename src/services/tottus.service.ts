import { cluster } from '../config/cluster';
import fs from 'fs';
import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
dotenv.config();

export class TottusService {

    private static visionClient = new vision.ImageAnnotatorClient({
        keyFilename: process.env.VISION_API_KEY
    });

    static async analyzePackaging(imagePath: string): Promise<string> {
        if (imagePath === 'Sin Imagen') {
            return 'No se ha recibido una imagen';
        }

        try {
            const [result] = await this.visionClient.labelDetection(imagePath);
            const labels = result.labelAnnotations?.map(label => label.description?.toLocaleLowerCase());

            const flexibleWords = ['pouch', 'bag', 'sachet', 'flexible', 'plastic bag', 'wrapper', 'foil', 'packet', 'envelope'];

            return labels?.some(label => flexibleWords.some(word => label!.includes(word))) ? 'Sí' : 'No';
        }
        catch (error) {
            console.error(error);
            return 'Error al analizar la imagen';
        }
    }

    
        
    static async getItemsbyURL(url: string): Promise<string> {
        return await cluster.execute(url, async ({ page, data }) => {
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
              );
            
            console.log('cargo')
            await page.goto(data, {
                waitUntil: 'domcontentloaded',
                timeout: 90000
            });

            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });

            await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 10000)));
            const html = await page.content();
            console.log(html);
            fs.writeFileSync('pagina.html', html);

            console.log("✅ HTML guardado en 'pagina.html'");
            const info = await page.evaluate(() => {
                const products = [...document.querySelectorAll('.pod')].map(el=>{
                    const categoria = 'Despensa';
                    const subCategoria = 'Despensa';
                    const marca = el.querySelector('b.pod-title')?.textContent?.trim() || 'Sin Marca';
                    const nombre = el.querySelector('b.pod-subTitle.subTitle-rebrand')?.textContent?.trim() || 'Sin Nombre';
                    const imagen  = el.querySelector('picture img')?.getAttribute('src') || 'Sin Imagen';

                    return {categoria,subCategoria,marca,nombre,imagen, esFlexible: ''}
                })
                return products
            })
            
            for (const product of info) {
                product.esFlexible = await this.analyzePackaging(product.imagen);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `productos-tottus-${timestamp}.json`;
        
            fs.writeFileSync(filename, JSON.stringify(info, null, 2), 'utf8');
            console.log(`✅ Productos guardados en '${filename}'`);
            return info;
        });
    }
}