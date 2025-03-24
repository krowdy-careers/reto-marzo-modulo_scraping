const Tesseract = require("tesseract.js");

async function analyzeImage(imageUrl) {
  try {
    console.log(`Analizando imagen: ${imageUrl}`);
    const {
      data: { text },
    } = await Tesseract.recognize(imageUrl, "eng");

    // Palabras clave para determinar si el empaque es flexible
    const keywords = ["flexible", "plastic", "soft", "bag"];
    const isFlexible = keywords.some((keyword) =>
      text.toLowerCase().includes(keyword)
    );

    return { flexible: isFlexible, textoDetectado: text };
  } catch (error) {
    console.error("Error en el análisis de imagen:", error);
    return { flexible: false, textoDetectado: "" };
  }
}

module.exports = { analyzeImage };
