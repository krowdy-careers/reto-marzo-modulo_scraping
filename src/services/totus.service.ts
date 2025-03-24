import { cluster } from "../config/cluster";
import fs from "fs";
import path from "path";
import { Product, PageResult } from "../models/product.model";
import { createObjectCsvWriter } from "csv-writer";
import geminiService from "../services/gemini.service";
import { autoScroll, downloadImageToBase64 } from "../utils/helpers";
import { AI_PROMPT } from "../config/constants";

export class TotusService {
  static async getProductsByUrl(
    url: string,
    maxPages?: number | null
  ): Promise<Product[]> {
    console.log("Iniciando scraping de productos en:", url);

    let allProducts: Product[] = [];
    let currentPage = 1;
    let hasNextPage = true;

    const outputDir = path.join(process.cwd(), "debug");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    while (hasNextPage && (!maxPages || currentPage <= maxPages)) {
      const pageUrl = currentPage === 1 ? url : `${url}?page=${currentPage}`;
      console.log(`Procesando página ${currentPage}: ${pageUrl}`);

      try {
        const pageData = await cluster.execute<PageResult>(
          pageUrl,
          async ({ page, data: pageUrl }) => {
            await page.setUserAgent(
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            );

            await page.goto(pageUrl, {
              waitUntil: "networkidle2",
              timeout: 90000,
            });

            console.log(
              "Página cargada, haciendo scroll para cargar productos..."
            );

            await autoScroll(page);

            const html = await page.content();
            fs.writeFileSync(
              path.join(outputDir, `tottus-page-${currentPage}.html`),
              html
            );
            console.log(
              `HTML guardado en 'debug/tottus-page-${currentPage}.html'`
            );

            return await page.evaluate(() => {
              const nextPageButton =
                document.querySelector(
                  '[data-testid="pagination-next-button"]:not([disabled])'
                ) ||
                document.getElementById("testId-pagination-top-arrow-right");
              const hasNext = !!nextPageButton;

              const products = Array.from(
                document.querySelectorAll(".pod-4_GRID")
              ).map((podEl) => {
                const nameEl = podEl.querySelector(".pod-title");
                const priceEl = podEl.querySelector(".line-height-22");
                const imgEl = podEl.querySelector("img");
                const brandEl = podEl.querySelector(".subTitle-rebrand");
                const category = podEl.getAttribute("data-category");
                const sellerEl = podEl.querySelector(".pod-sellerText");

                return {
                  name: nameEl ? nameEl.textContent?.trim() : null,
                  price: priceEl?.innerHTML,
                  imageUrl: imgEl ? imgEl.getAttribute("src") : null,
                  brand: brandEl ? brandEl.textContent?.trim() : null,
                  category: category || null,
                  seller: sellerEl ? sellerEl.textContent?.trim() : null,
                  url: podEl.querySelector("a")
                    ? (podEl.querySelector("a") as HTMLAnchorElement).href
                    : null,
                  isFlexible: null,
                };
              });

              return {
                products,
                hasNextPage: hasNext,
              };
            });
          }
        );

        if (pageData && pageData.products) {
          console.log(
            `Extraídos ${pageData.products.length} productos de la página ${currentPage}`
          );

          for (const product of pageData.products) {
            if (product.imageUrl) {
              try {
                const imageBase64 = await downloadImageToBase64(
                  product.imageUrl
                );
                const prompt = AI_PROMPT;
                console.log("PROMPT", AI_PROMPT);
                const isFlexible = await geminiService.analyzeImageFromBase64(
                  imageBase64,
                  "image/jpeg",
                  prompt
                );

                if (isFlexible !== null) {
                  product.isFlexible = isFlexible;
                  console.log(
                    `Análisis de la imagen ${product.imageUrl}:`,
                    isFlexible
                  );
                }
              } catch (error) {
                console.error(
                  `Error al descargar o analizar la imagen ${product.imageUrl}:`,
                  error
                );
              }
            }
          }

          allProducts = [...allProducts, ...pageData.products];
          hasNextPage = pageData.hasNextPage;
        } else {
          console.log(
            `No se encontraron productos en la página ${currentPage}`
          );
          hasNextPage = false;
        }
      } catch (error: any) {
        console.error(`Error procesando página ${currentPage}:`, error);
        fs.writeFileSync(
          path.join(outputDir, `error-page-${currentPage}.txt`),
          `URL: ${pageUrl}\nError: ${error.message}\n${error.stack}`
        );
        hasNextPage = false;
      }

      if (hasNextPage) {
        currentPage++;
        await new Promise((resolve) =>
          setTimeout(resolve, 3000 + Math.random() * 2000)
        );
      }
    }

    console.log(
      `Scraping completado. Total de productos extraídos: ${allProducts.length}`
    );

    fs.writeFileSync(
      path.join(outputDir, "tottus-products.json"),
      JSON.stringify(allProducts, null, 2)
    );

    const csvWriter = createObjectCsvWriter({
      path: path.join(outputDir, "tottus-products.csv"),
      header: [
        { id: "name", title: "Nombre" },
        { id: "brand", title: "Marca" },
        { id: "price", title: "Precio" },
        { id: "normalPrice", title: "Precio Normal" },
        { id: "imageUrl", title: "URL Imagen" },
        { id: "category", title: "Categoría" },
        { id: "seller", title: "Vendedor" },
        { id: "url", title: "URL Producto" },
        { id: "isFlexible", title: "Análisis IA" },
      ],
    });

    await csvWriter.writeRecords(allProducts);
    console.log("Datos exportados a CSV correctamente");

    return allProducts;
  }
}
