const puppeteer = require("puppeteer");
const analyzeImage = require("./utils/aiAnalysis");
const { BASE_URL } = require("./constants");
const { hasNextPage, goToNextPage } = require("./utils/pagination");

async function scrapeProducts() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let products = [];
  let currentPage = 1;

  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("page", currentPage);

    await page.goto(url.toString(), {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });

    while (true) {
      console.log(`🔍 Scraping página ${currentPage}...`);

      await page.waitForSelector(".pod", { timeout: 10000 });

      // Simula un pequeño retraso en la carga
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let currentProducts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".pod")).map((product) => {
          const imageElement = product.querySelector("img");
          let imageUrl =
            imageElement?.getAttribute("data-src") ||
            imageElement?.getAttribute("srcset")?.split(" ")[0] ||
            imageElement?.src ||
            null;

          if (imageUrl && imageUrl.startsWith("/")) {
            imageUrl = new URL(imageUrl, document.location.origin).href;
          }

          return {
            category: product.getAttribute("data-category") || "Sin categoría",
            subCategory:
              product.getAttribute("data-gsccategory") || "Sin subcategoría",
            name:
              product.querySelector(".pod-subTitle")?.textContent.trim() ||
              "Sin nombre",
            brand:
              product.querySelector(".pod-title")?.textContent.trim() ||
              "Sin Marca",
            image: imageUrl,
            price:
              product.querySelector(".prices-0 span")?.textContent.trim() ||
              "Precio no disponible",
          };
        });
      });

      console.log("✅ Datos extraídos:", currentProducts.length, "productos");

      for (const product of currentProducts) {
        if (product.image) {
          try {
            product.isFlexiblePackaging = await analyzeImage(product.image);
          } catch (error) {
            console.error(
              `❌ Error analizando imagen: ${product.image}`,
              error
            );
            product.isFlexiblePackaging = null;
          }
        } else {
          product.isFlexiblePackaging = null;
        }
      }

      products = [...products, ...currentProducts];

      const isNextPage = await hasNextPage(page);
      if (!isNextPage) {
        console.log("🚀 Scraping finalizado. No hay más páginas.");
        break;
      }

      await goToNextPage(page);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 2000 + 5000)
      );
      currentPage++;
    }
  } catch (error) {
    console.error("❌ Error durante el scraping:", error);
  } finally {
    await browser.close();
  }

  return products;
}

module.exports = scrapeProducts;
