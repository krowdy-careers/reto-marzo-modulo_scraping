class ProductsScraper {
  async scrapeProducts(page, url) {
    await page.goto(url, { waitUntil: "networkidle2" });

    const scrollPageToBottom = async () => {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
    };

    await scrollPageToBottom();
    await page.waitForSelector(".pod.pod-4_GRID");

    const productData = await page.evaluate(() => {
      const productElements = document.querySelectorAll(".pod.pod-4_GRID");

      const products = Array.from(productElements).map((element) => {
        const brand = element.querySelector(".pod-title")?.innerText.trim() || "No brand";
        const name = element.querySelector(".pod-subTitle")?.innerText.trim() || "No name";
        const price = element.querySelector(".prices-0 span")?.innerText.trim() || "No price";
        const image = element.querySelector("img")?.src || "No image";
        const link = element.href || "No link";

        return {
          brand,
          name,
          price,
          image,
          link,
        };
      });

      return products;
    });

    return productData;
  }
}

module.exports = new ProductsScraper();
