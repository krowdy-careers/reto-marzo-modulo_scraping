import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
import fs from "fs/promises";

config();
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);// token  API de Hugging Face

// Función para analizar la imagen y determinar si es flexible o rígida
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

// Función para procesar todos los productos
export async function processProducts(limit: number = 10): Promise<any[]> {
    try {
       
        const data = await fs.readFile("productos.json", "utf-8");
        const productos = JSON.parse(data).slice(0, limit); ;
        const promesas = productos.map(async (producto: any) => {  //clasificar cada producto
            const esFlexible = await classifyImage(producto.imagen);
            // console.log(`✅ Resultado para ${producto.nombre}: ${esFlexible}`);
            producto.esFlexible = esFlexible;  
            return producto;
          });

        const productosClasificados = await Promise.all(promesas);
        await fs.writeFile("productos_clasificados.json", JSON.stringify(productosClasificados, null, 2)
        );
        console.log(`👌🎉✅Resultados guardados en productos_clasificados.json`);
        console.log(productosClasificados.length);

        return productosClasificados;
    } catch (error) {
        console.error("Error al procesar los productos:", error);
        throw error;
    }
}