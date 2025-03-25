const scrapeProducts = require("./src/scraper");
const saveData = require("./src/utils/saveData");

(async () => {
  try {
    console.log("Iniciando proceso de scraping...");
    const products = await scrapeProducts();

    console.log("Guardando datos en JSON y CSV...");
    await saveData(products, "./data/output.json", "./data/output.csv");

    console.log("Proceso completado con éxito.");
  } catch (error) {
    console.error("Error durante el proceso:", error);
  }
})();
