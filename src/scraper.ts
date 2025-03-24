import 'dotenv/config'; // Carga las variables de entorno desde .env
import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { sleep } from './utils/helper';
import { classifySubcategoryGoogle as classifySubcategory, classifyPackagingFlexibilityGoogle as classifyPackagingFlexibility } from './ia';
import { Parser as Json2csvParser } from 'json2csv';

interface Product {
    category: string;
    subcategory: string;
    name: string;
    brand: string;
    imageUrl: string;
    isFlexiblePackaging: boolean;
}

async function scrapePage(page: Page): Promise<Product[]> {
    return await page.evaluate(() => {
        const products: Product[] = [];
        const productCards = document.querySelectorAll('a[data-pod="catalyst-pod"]');
        productCards.forEach(card => {
            // Extrae el nombre desde un elemento con clase que contenga "pod-subTitle"
            const name = card.querySelector('[class*="pod-subTitle"]')?.textContent?.trim() || '';
            // Extrae la marca desde un elemento con clase que contenga "pod-title"
            const brand = card.querySelector('[class*="pod-title"]')?.textContent?.trim() || '';
            // Extrae la URL de la imagen (toma la primera <img> encontrada)
            const imageEl = card.querySelector('img');
            const imageUrl = imageEl ? (imageEl as HTMLImageElement).src : '';
            const category = 'Despensa';
            products.push({
                category,
                subcategory: '', // Se asignará posteriormente mediante IA
                name,
                brand,         // Se extrae directamente del DOM
                imageUrl,
                isFlexiblePackaging: false // Se asignará mediante IA
            });
        });
        return products;
    });
}

async function scrapeSubcategories(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.facet-with-mini-pods'));
        return buttons.map(btn => btn.textContent?.trim() || '').filter(text => text.length > 0);
    });
}

async function scrapeAllPages(page: Page): Promise<Product[]> {
    let allProducts: Product[] = [];
    let currentPage = 1;

    // Extrae las subcategorías disponibles de la página inicial
    const availableSubcategories = await scrapeSubcategories(page);
    console.log('Subcategorías disponibles:', availableSubcategories);

    // Define candidate labels para la clasificación de empaques
    const packagingCandidates = ["Flexible", "No flexible"];

    while (true) {
        const url = `https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa?subdomain=tottus&page=${currentPage}&store=tottus`;
        console.log(`Navegando a la página ${currentPage}: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        try {
            await page.waitForSelector('a[data-pod="catalyst-pod"]', { timeout: 15000 });
        } catch (err) {
            console.log(`Timeout esperando productos en la página ${currentPage}`);
        }

        const products = await scrapePage(page);
        console.log(`Encontrados ${products.length} productos en la página ${currentPage}`);

        if (products.length === 0) {
            console.log('No se encontraron más productos. Fin de la paginación.');
            break;
        }

        // Para cada producto, utiliza la IA para clasificar la subcategoría y la flexibilidad del empaque
        for (const product of products) {
            if (product.imageUrl) {
                // Clasifica la subcategoría usando las subcategorías disponibles extraídas del DOM
                product.subcategory = await classifySubcategory(product.imageUrl, availableSubcategories);
                // Clasifica la flexibilidad del empaque usando packagingCandidates
                const packagingLabel = await classifyPackagingFlexibility(product.imageUrl, packagingCandidates);
                product.isFlexiblePackaging = (packagingLabel.toLowerCase() === "flexible");
            } else {
                product.subcategory = 'Desconocido';
                product.isFlexiblePackaging = false;
            }
        }
        allProducts = allProducts.concat(products);
        currentPage++;
        await sleep(1000);
    }
    return allProducts;
}

async function main() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navega a la URL base para extraer las subcategorías y productos
    const baseUrl = 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa';
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });

    const allProducts = await scrapeAllPages(page);
    await browser.close();

    // Guarda los resultados en formato JSON
    const outputJsonPath = path.join(__dirname, '..', 'data', 'products.json');
    fs.writeFileSync(outputJsonPath, JSON.stringify(allProducts, null, 2), 'utf-8');
    console.log(`Scraping completado. ${allProducts.length} productos guardados en ${outputJsonPath}`);

    // Convierte los datos a CSV utilizando json2csv
    try {
        const fields = ['category', 'subcategory', 'name', 'brand', 'imageUrl', 'isFlexiblePackaging'];
        const json2csvParser = new Json2csvParser({ fields });
        const csvData = json2csvParser.parse(allProducts);
        const outputCsvPath = path.join(__dirname, '..', 'data', 'products.csv');
        fs.writeFileSync(outputCsvPath, csvData, 'utf-8');
        console.log(`Datos convertidos a CSV y guardados en ${outputCsvPath}`);
    } catch (err) {
        console.error('Error generando el CSV:', err);
    }
}

main().catch(err => {
    console.error('Error en la ejecución:', err);
});
