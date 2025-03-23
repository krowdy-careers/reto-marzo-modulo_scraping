class CategoryScraper {
  async extractCategoryAndSubcategory(page, url) {
    await page.goto(url, { waitUntil: "networkidle2" });

    const { category, subcategory } = await page.evaluate(() => {
      const breadcrumbElements = document.querySelectorAll(
        ".Breadcrumbs-module_breadcrumb__3lLwJ a"
      );
      const breadcrumbs = Array.from(breadcrumbElements).map((element) =>
        element.innerText.trim()
      );

      const category = breadcrumbs[breadcrumbs.length - 2] || "";
      const subcategory = breadcrumbs[breadcrumbs.length - 1] || "";

      return { category, subcategory };
    });

    return { category, subcategory };
  }
}

module.exports = new CategoryScraper();
