const { request, response } = require("express");

const scraperService = require("../services/scraperService");
const productsScraper = require("../services/productsScraper");

const extractDataPost = async (req = request, res = response) => {
  const { page } = req.body;

  const url = `https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa?page=${page}`;

  try {
    const products = await scraperService.scrape(
      url,
      async ({ page, data: url }) => {
        return await productsScraper.scrapeProducts(page, url);
      }
    );

    res.json({
      success: true,
      products,
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
  extractDataPost,
};
