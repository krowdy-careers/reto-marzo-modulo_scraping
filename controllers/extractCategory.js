const { request, response } = require("express");

const scraperService = require("../services/scraperService");
const categoryScraper = require("../services/categoryScraper");

const extractCategoryPost = async (req = request, res = response) => {
  const { productUrl } = req.body;

  try {
    const { category, subcategory } = await scraperService.scrape(
      productUrl,
      async ({ page, data: url }) => {
        return await categoryScraper.extractCategoryAndSubcategory(page, url);
      }
    );

    res.json({
      success: true,
      category,
      subcategory,
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
  extractCategoryPost,
};
