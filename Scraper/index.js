import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa';
    await page.goto(url, { waitUntil: 'networkidle2' });

    let products = [];
    let hasNextPage = true;

    while (hasNextPage) {
        // Extraer datos de los productos
        const extractedProducts = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.pod')).map(product => {
                const imgElement = product.querySelector('picture img'); // Buscar la imagen dentro de cada producto
                return {
                    categoria: 'Despensa',
                    subcategoria: product.querySelector('.pod-sellerText')?.innerText || 'N/A',
                    nombre: product.querySelector('.pod-title')?.innerText.trim() || 'N/A',
                    marca: product.querySelector('.pod-subTitle')?.innerText.trim() || 'N/A',
                    imagen: imgElement ? imgElement.getAttribute('src') : 'N/A', // Obtener el src directamente
                };
            });
        });
        

        products = products.concat(extractedProducts);
        console.log(`Productos extraídos: ${products.length}`);

        // Verificar si hay una página siguiente
        const nextPageButton = await page.$('#testId-pagination-bottom-arrow-right');
        const isButtonVisible = nextPageButton && await page.evaluate(button => {
            const style = window.getComputedStyle(button);
            return style && style.display !== 'none' && !button.disabled;
        }, nextPageButton);

        if (isButtonVisible) {
            console.log('Avanzando a la siguiente página...');
            
            // Hacer clic en la siguiente página
            await page.evaluate(() => {
                document.querySelector('#testId-pagination-bottom-arrow-right').click();
            });

            // Esperar un poco antes de verificar los nuevos productos
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Esperar a que aparezcan nuevos productos
            await page.waitForSelector('.pod', { timeout: 10000 });

        } else {
            console.log('No hay más páginas.');
            hasNextPage = false;
        }
    }

    await browser.close();

    // Guardar los datos en un archivo JSON
    fs.writeFileSync('productos_despensa.json', JSON.stringify(products, null, 2));
    console.log('✅ Datos extraídos y guardados en productos_despensa.json');
})();
