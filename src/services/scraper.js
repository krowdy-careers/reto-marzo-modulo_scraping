const puppeteer = require("puppeteer");

async function scrapeProducts() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(
    "https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa"
  );

  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".pod")).map((product) => ({
      categoria: "Despensa",
      subcategoria: product.querySelector(".l2category")?.innerText || "N/A",
      nombre: product.querySelector(".pod-subTitle")?.innerText || "N/A",
      marca: product.querySelector(".pod-title")?.innerText || "N/A",
      imagen: product.querySelector("img")?.src || "",
    }));
  });

  await browser.close();
  return products;
}

module.exports = { scrapeProducts };
