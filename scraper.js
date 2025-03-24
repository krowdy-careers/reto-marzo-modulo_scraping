const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Depuracion
    const page = await browser.newPage();
    await page.goto("https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa", { waitUntil: "networkidle2" });

    const allProducts = [];

    let hasNextPage = true;
    let pageNumber = 1;

    while (hasNextPage) {
        console.log(`Scrapeando página ${pageNumber}...`);


        // Extraccion productos de la pagina
        const products = await page.$$eval(".pod", (nodes) => {
            return nodes.map((node) => {
                const name = node.querySelector(".pod-title")?.innerText.trim() || "Sin nombre";
                const brand = node.querySelector(".pod-subTitle")?.innerText.trim() || "Sin marca";
                const imageUrl = node.querySelector(".pod-image img")?.src || "";
                return { category: "Despensa", name, brand, imageUrl };
            });
        });

        allProducts.push(...products);

        // En busca del boton "siguiente"
        const nextButton = await page.$(".fb-paginator__next");
        if (nextButton) {
            await nextButton.click(); 
            await page.waitForTimeout(3000); 
            pageNumber++; 
        } else {
            hasNextPage = false; 
        }
    }

    // Almacenamos datos en json
    fs.writeFileSync("products.json", JSON.stringify(allProducts, null, 2));
    console.log("Scraping completado. Datos guardados en products.json");

    await browser.close();
})();