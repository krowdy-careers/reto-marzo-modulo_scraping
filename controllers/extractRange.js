const { request, response } = require("express");

const scraperService = require("../services/scraperService");
const productsScraper = require("../services/productsScraper");

const extractRangePost = async (req = request, res = response) => {
  const { startPage, endPage } = req.body;

  try {
    const allProducts = [];

    const scrapePromises = [];
    for (let page = startPage; page <= endPage; page++) {
      const url = `https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa?page=${page}`;

      scrapePromises.push(
        scraperService.scrape(url, async ({ page, data: url }) => {
          const products = await productsScraper.scrapeProducts(page, url);
          return products;
        })
      );
    }

    const results = await Promise.all(scrapePromises);

    results.forEach((products) => {
      allProducts.push(...products);
    });

    res.json({
      success: true,
      totalProducts: allProducts.length,
      products: allProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  extractRangePost,
};
