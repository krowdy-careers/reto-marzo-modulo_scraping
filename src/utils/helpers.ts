import axios from "axios";

export async function autoScroll(page: any): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<boolean>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    });
  });

  await page.evaluate(() => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  });
}

export async function downloadImageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    console.log(`Imagen descargada y convertida a base64: ${imageUrl}`);
    return base64;
  } catch (error) {
    console.error(`Error al descargar la imagen ${imageUrl}:`, error);
    throw error;
  }
}
