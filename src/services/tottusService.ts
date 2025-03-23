import { initCluster } from "../config/cluster";
import fs from "fs";

export const getItemsTottus = async (baseUrl: string): Promise<any[]> => {
    const cluster = await initCluster();
    let allProducts: any[] = [];

    const totalPages = await cluster.execute(baseUrl, async ({ page }) => {
        await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 90000 });

        // 📌 Extraer el número total de páginas
        const pages = await page.evaluate(() => {
            const pageButtons = [...document.querySelectorAll('button.pagination-button-mkp')];
            const pageNumbers = pageButtons.map(el => Number(el.textContent)).filter(n => !isNaN(n));
            return Math.max(...pageNumbers); // Devolver el número mas alto
        });

        // console.log(`📌 Total de páginas detectadas: ${pages}`);
        return pages;
    });

    // 🔹 Agregar todas las páginas a la cola del cluster
    for (let i = 1; i <= totalPages; i++) {
        const url = `${baseUrl}?page=${i}`;
        cluster.execute(url, async ({ page, data: url }) => {
            console.log(`🚀 Procesando página: ${url}`);
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            );

            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
            // console.log("📦 Haciendo scroll...");

            for (let i = 0; i < 8; i++) { // asegurar que todos los productos tienen url 
                await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            console.log("📌 Extrayendo productos...");
            const urlParts = new URL(url).pathname.split("/");
            const category = urlParts[urlParts.length - 1] || "Categoría desconocida";

            const products = await page.evaluate((category) => {
                return Array.from(document.querySelectorAll('.pod')).map(el => ({
                    category,
                    subcategoria: el.closest('.section')?.querySelector('.section-title')?.textContent?.trim() || 'No categorizado',
                    nombre: el.querySelector('.pod-subTitle')?.textContent?.trim() || 'Sin nombre',
                    marca: el.querySelector('.pod-title')?.textContent?.trim() || 'Sin marca',
                    imagen: el.querySelector('picture img')?.getAttribute('src') || 'Sin imagen',
                    precio: el.querySelector('.prices-0 span')?.textContent?.trim() || 'Sin precio'
                }));
            }, category);
            // console.log(`✅ Página procesada ${i}: ${products.length} productos`);
            allProducts.push(...products);

        });
    }

    await cluster.idle();
    await cluster.close();

    console.log(`🎯 Total de productos extraídos: ${allProducts.length}`);

    // 🔹 Guardar los datos en JSON
    const filePath = "productos.json";
    fs.writeFileSync(filePath, JSON.stringify(allProducts, null, 2));
    console.log(`✅ Datos guardados en '${filePath}'`);

    return allProducts;
};
