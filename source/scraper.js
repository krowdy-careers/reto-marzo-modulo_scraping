import { launch } from 'puppeteer';
import fs from 'fs';
import { analyzeImages } from './recognition.js';

const urlWeb = 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa';
const categoryClass = 'button.jsx-2929192365.facet-with-mini-pods';
const nextButtonID = '#testId-pagination-top-arrow-right';

const productItem = 'div.jsx-1068418086';
const imageURL = 'img.jsx-1996933093';
const productName = 'b.jsx-4014752167.primary';
const brandName = 'b.jsx-4014752167.secondary';

const uniqueName = 'h1.jsx-783883818.product-name'
const uniqueTable = 'table.jsx-960159652.specification-table'
const uniqueTR = 'tr.jsx-960159652'
const uniqueBrandHeader = 'td.jsx-960159652.property-name'
const uniqueBrandName = 'td.jsx-960159652.property-value'
const uniqueImage = 'img.jsx-2487856160'

let allProducts = [];

async function ProcessUniqueProduct(page, category, subcategory, categoryUrl) {

    await page.waitForFunction(() => document.readyState === "complete");

    const productData = await page.evaluate(({ uniqueName, uniqueTable, uniqueTR, uniqueBrandHeader, uniqueBrandName, uniqueImage, category, subcategory }) => {
        const nameElement = document.querySelector(uniqueName);
        const tableElement = document.querySelector(uniqueTable);
        const rows = tableElement ? Array.from(tableElement.querySelectorAll(uniqueTR)) : [];
        const imageElement = document.querySelector(uniqueImage);
        const uniqueImageUrl = imageElement ? imageElement.getAttribute("src") : "N/A";

        let brandText = "N/A";

        for (const row of rows) {
            const header = row.children[0];
            if (header && header.matches(uniqueBrandHeader) && header.innerText.trim() === "Marca") {
                const brandValue = row.children[1];
                if (brandValue && brandValue.matches(uniqueBrandName)) {
                    brandText = brandValue.innerText.trim() || "N/A";
                }
                break;
            }
        }

        return {
            Categoria: category,
            Subcategoria: subcategory,
            Nombre: nameElement ? nameElement.innerText.trim() : "N/A",
            Marca: brandText,
            Imagen: uniqueImageUrl,
            Flexibilidad : "por definir..."
        };
    }, { uniqueName, uniqueTable, uniqueTR, uniqueBrandHeader, uniqueBrandName, uniqueImage, category, subcategory });

    allProducts.push(productData);

    console.log(`Volviendo a: ${categoryUrl}...`);
    await page.goto(categoryUrl, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.readyState === "complete");
}


async function SubCategoryIteration(page, categoryName, categoryUrl) {
    console.log(`Buscando subcategorias en: ${categoryName}`);

    try {
        await page.waitForSelector(categoryClass, { timeout: 5000 });
    } catch (error) {
        console.log(`No se encontraron subcategorias en: ${categoryName}`);
        return false;
    }

    const totalBotonesSubCat = await page.evaluate(categoryClass => 
        document.querySelectorAll(categoryClass).length, categoryClass);

    console.log(`Se encontraron ${totalBotonesSubCat} subcategorias en: ${categoryName}`);

    for (let i = 0; i < totalBotonesSubCat; i++) {
        console.log(`Entrando en la subcategoria ${i}...`);

        const subCategoryName = await page.evaluate((categoryClass, index) => {
            const botones = document.querySelectorAll(categoryClass);
            return botones[index]?.innerText.trim() || `Subcategoria ${index}`;
        }, categoryClass, i);

        const botonExiste = await page.evaluate((categoryClass, index) => {
            const botones = document.querySelectorAll(categoryClass);
            if (botones[index]) {
                botones[index].click();
                return true;
            }
            return false;
        }, categoryClass, i);

        if (!botonExiste) {
            continue;
        }

        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.readyState === "complete");

        console.log(`Ahora en la subcategoría: ${subCategoryName}.`);

        await CheckProducts(page, categoryName, subCategoryName, categoryUrl);

        console.log(`Volviendo a la categoria: ${categoryName}...`);
        await page.goto(categoryUrl, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.readyState === "complete");
    }

    return true;
}

async function CategoryIteration(page) {
    console.log("Buscando categorias...");

    try {
        await page.waitForSelector(categoryClass, { timeout: 5000 });
    } catch (error) {
        console.log("No se encontraron categorias");
        return;
    }

    const totalBotonesCat = await page.evaluate(categoryClass => 
        document.querySelectorAll(categoryClass).length, categoryClass);

    console.log(`Se encontraron ${totalBotonesCat} categorias`);

    for (let i = 0; i < totalBotonesCat; i++) {
        await page.goto(urlWeb, { waitUntil: "domcontentloaded" });
        
        await Promise.race([
            page.waitForFunction(() => document.readyState === "complete").catch(() => null),
            new Promise(resolve => setTimeout(resolve, 10000))
        ]);

        const categoryName = await page.evaluate((categoryClass, index) => {
            const botones = document.querySelectorAll(categoryClass);
            return botones[index]?.innerText.trim() || Categoría `${index}`;
        }, categoryClass, i);

        const botonExiste = await page.evaluate((categoryClass, index) => {
            const botones = document.querySelectorAll(categoryClass);
            if (botones[index]) {
                botones[index].click();
                return true;
            }
            return false;
        }, categoryClass, i);

        if (!botonExiste) {
            continue;
        }

        console.log(`Entrando en la categoria: ${categoryName}...`);
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.readyState === "complete");
        const categoryUrl = page.url();

        let hasSubCategories = await SubCategoryIteration(page, categoryName, categoryUrl);
        if (!hasSubCategories) {
            await CheckProducts(page, categoryName, categoryName, urlWeb);
        }
    }
}

async function CheckProducts(page, category, subcategory, categoryUrl) {
    console.log(`Iniciando paginacion en: ${subcategory}`);

    while (true) {

        await GetProductstData(page, category, subcategory);
        const isButtonAvailable = await page.waitForSelector(nextButtonID, { timeout: 5000 }).then(() => true).catch(() => false);

        if (!isButtonAvailable) {
            await ProcessUniqueProduct(page, category, subcategory, categoryUrl);
            break;
        }

        const nextPageButtonEnabled = await page.evaluate(nextButtonID => {
            const btn = document.querySelector(nextButtonID);
            return btn && !btn.hasAttribute('disabled');
        }, nextButtonID);

        if (!nextPageButtonEnabled) {
            console.log("No hay mas paginas disponibles");
            break;
        }

        console.log(">> Avanzando a la siguiente pagina >>");
        await page.evaluate(nextButtonID => document.querySelector(nextButtonID).click(), nextButtonID);

        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.readyState === "complete");
    }

}

async function GetProductstData(page, category, subcategory) {
    console.log(`Obteniendo productos de: ${subcategory}`);

    await page.waitForFunction(() => document.readyState === "complete");
    await new Promise(resolve => setTimeout(resolve, 3500));

    await AutoScroll(page);

    const products = await page.evaluate(({ productItem, imageURL, productName, brandName, category, subcategory }) => {
        return Array.from(document.querySelectorAll(productItem)).map(product => ({
            Categoria : category, 
            Subcategoria : subcategory,
            Nombre: product.querySelector(productName)?.innerText.trim() || 'N/A',
            Marca: product.querySelector(brandName)?.innerText.trim() || 'N/A',
            Imagen: product.querySelector(imageURL)?.src || 'N/A',
            Flexibilidad : "por definir..."
        }));
    }, { productItem, imageURL, productName, brandName, category, subcategory });

    allProducts.push(...products);
}

async function AutoScroll(page) {
    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 20;
            const scrollDelay = 50;

            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, scrollDelay);
        });
    });

    console.log("=== Scroll completado ===");
}

async function SaveToJSON() {
    
    const analyzedProducts = await analyzeImages(allProducts);

    fs.writeFileSync('productos.json', JSON.stringify(analyzedProducts, null, 2));
}

async function StartScraping() {

    const browser = await launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1050, height: 800 });

    await page.goto(urlWeb, { waitUntil: "domcontentloaded", timeout: 20000 });

    await CategoryIteration(page);

    await SaveToJSON();
    
    await browser.close();
}

StartScraping();