const vision = require("@google-cloud/vision");
const axios = require("axios");
const { GOOGLE_APPLICATION_CREDENTIALS } = require("../config");

// Configura credenciales solo si no están definidas en el entorno
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = GOOGLE_APPLICATION_CREDENTIALS;
}

// Crear cliente de Google Cloud Vision
const client = new vision.ImageAnnotatorClient();

async function analyzeImage(imageUrl) {
  try {
    console.log(`🔍 Analizando imagen: ${imageUrl}`);

    // Descargar la imagen en buffer
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");

    // Analizar la imagen con Google Cloud Vision
    const [result] = await client.labelDetection({
      image: { content: imageBuffer },
    });

    // Extraer etiquetas detectadas
    const labels = result.labelAnnotations.map((label) =>
      label.description.toLowerCase()
    );
    console.log("✅ Etiquetas detectadas:", labels);

    // Verificar si el empaque es flexible
    const isFlexible = labels.some((label) =>
      ["plastic", "bag", "pouch", "wrapper", "film"].includes(label)
    );

    return isFlexible;
  } catch (error) {
    console.error("❌ Error al analizar la imagen:", error.message);
    return null;
  }
}

module.exports = analyzeImage;
