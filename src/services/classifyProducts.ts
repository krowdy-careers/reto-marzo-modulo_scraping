import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
import fs from "fs/promises";

config();
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);// token  API de Hugging Face

// Función para analizar la imagen
async function classifyImage(imageUrl: string): Promise<boolean> {
    const imageBlob = await (await fetch(imageUrl)).blob();
    try {
        const response = await hf.zeroShotImageClassification({
            model: "openai/clip-vit-large-patch14-336",
            inputs: {
                image: imageBlob,
            },
            parameters: {
                candidate_labels: ["flexible", "rigid"],
            },
        });
        // console.log("Respuesta de CLIP:", response); // Depuración
        if (response && response.length > 0) {
            const topLabel = response[0];
            return topLabel.label === "flexible";
        } else {
            console.log("No se pudo clasificar la imagen.");
            return false;
        }
    } catch (error) {
        console.error("Error en la inferencia:", error);
        return false;
    }
}

// Función para analizar todos los productos scrapeados - Se limito  
export async function classifyProducts(products: any[], limit: number = 50): Promise<any[]> {
    try {
        const limitedProducts = products.slice(0, limit);
        const batchSize = 40; // Tamaño del lote ya que la API de Hugging Face tiene un límite de solicitudes por minuto
        let classifiedProducts: any[] = [];

        for (let i = 0; i < limitedProducts.length; i += batchSize) {
            const batch = limitedProducts.slice(i, i + batchSize).filter(p => p.imagen && p.imagen.startsWith("http")); // Filtra imágenes inválidas
            // console.log(`Procesando bloque ${i + 1} - ${i + batch.length}...`);

            const promises = batch.map(async (producto: any) => {
                const isFlexible = await classifyImage(producto.imagen);
                producto.isFlexible = isFlexible;
                return producto;
            });

            const batchResults = await Promise.all(promises);
            classifiedProducts = classifiedProducts.concat(batchResults);
        }

        await fs.writeFile("productos_clasificados.json", JSON.stringify(classifiedProducts, null, 2));
        console.log(`✅ Resultados guardados en productos_clasificados.json 🎉`);
        console.log(`🎯 Total de productos clasificados: ${classifiedProducts.length}`);

        return classifiedProducts;
    } catch (error) {
        console.error("❌ Error al procesar los productos:", error);
        throw error;
    }
}

