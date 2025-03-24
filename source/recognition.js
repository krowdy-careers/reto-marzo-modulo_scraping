import fs from 'fs';
import axios from 'axios';
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
const AWS_CREDENTIALS_FILE = './service/keyAWS.json';


const credentials = JSON.parse(fs.readFileSync(AWS_CREDENTIALS_FILE, 'utf8')); // Aqui colocamos las credenciales para acceder al servicio de AWS

const client = new RekognitionClient({
    region: credentials.Region,
    credentials: {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
    },
});

const banList = [
    "Bottle", "Jar", "Can", "Box", "Glass", "Metal", "Tin", "Carton", "Container", "Plastic Container", "Peanut Butter"
]; 
//AWS usa sustantivos para la identificacion de objetos en lugar de adjetivos. En vez de tratar de definir qué es un
//artículo flexible, mediante pruebas se determinó que era mejor evaluar qué NO era una artículo flexible. La ban list nos ayuda
//a identificar etiquetas que pueden dar con articulos que son rígidos.

async function analyzeImageFromUrl(imageUrl) {
    try {
        console.log(`Analizando imagen: ${imageUrl}`);

        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        const command = new DetectLabelsCommand({
            Image: { Bytes: imageBuffer },
            MaxLabels: 10,
            MinConfidence: 60,
        });

        const result = await client.send(command);
        const labels = result.Labels.map(label => label.Name);

        console.log("Etiquetas detectadas: ", labels);

        const hasBannedLabel = labels.some(label => banList.includes(label));
        //Si la etiqueta esta en la lista de baneados, hasBannedLabel devuelve true; sino, false;

        return !hasBannedLabel;
    } catch (error) {
        return false; //Si por cualquier motivo la imagen no cargó, solo devolveremos que no es un articulo flexible
    }
}

export async function analyzeImages(products) {

    //Analizaremos aqui cada uno de los enlaces de los productos que tenemos en el arreglo del script scraper.js

    const analyzedProducts = await Promise.all(products.map(async product => {
        console.log("Analizando producto...");
        const Flexibilidad = (await analyzeImageFromUrl(product.Imagen)) ? "Empaque flexible" : "Empaque no flexible";
        return { ...product, Flexibilidad };
    }));

    return analyzedProducts;
}
