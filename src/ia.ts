import axios from 'axios';
import { GOOGLE_API_KEY, AI_ENDPOINT } from './config/config';
import stringSimilarity from 'string-similarity';

export async function downloadImageToBase64(imageUrl: string): Promise<string> {
    try {
        const encodedUrl = encodeURI(imageUrl);
        const axiosResponse = await axios.get(encodedUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(axiosResponse.data, 'binary');
        return buffer.toString('base64');
    } catch (error: any) {
        console.error("Error descargando la imagen:", error.message);
        throw error;
    }
}

export async function analyzeImageGoogle(imageBase64: string): Promise<string[]> {
    if (!GOOGLE_API_KEY) {
        throw new Error("No se encontró GOOGLE_API_KEY en las variables de entorno.");
    }
    const endpoint = `${AI_ENDPOINT}?key=${GOOGLE_API_KEY}`;
    try {
        const response = await axios.post(
            endpoint,
            {
                requests: [
                    {
                        image: { content: imageBase64 },
                        features: [{ type: "LABEL_DETECTION", maxResults: 10 }]
                    }
                ]
            },
            { headers: { "Content-Type": "application/json" } }
        );
        const annotations = response.data.responses[0]?.labelAnnotations || [];
        return annotations.map((a: any) => a.description);
    } catch (error: any) {
        console.error("Error analizando la imagen con Google Cloud Vision:", error.response ? error.response.data : error.message);
        return [];
    }
}

function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '');
}

function bestMatch(candidateLabels: string[], detectedLabels: string[]): string {
    let bestCandidate = 'Desconocido';
    let bestScore = 0;
    for (const candidate of candidateLabels) {
        for (const detected of detectedLabels) {
            const score = stringSimilarity.compareTwoStrings(candidate.toLowerCase(), detected.toLowerCase());
            if (score > bestScore) {
                bestScore = score;
                bestCandidate = candidate;
            }
        }
    }
    // Ajusta el umbral según tus necesidades. Por ejemplo, 0.3.
    return bestScore >= 0.3 ? bestCandidate : 'Desconocido';
}

export async function classifyLabelGoogle(imageUrl: string, candidateLabels: string[]): Promise<string> {
    try {
        const imageBase64 = await downloadImageToBase64(imageUrl);
        const detectedLabels = await analyzeImageGoogle(imageBase64);
        console.log("Etiquetas detectadas:", detectedLabels);
        return bestMatch(candidateLabels, detectedLabels);
    } catch (error: any) {
        console.error("Error clasificando la imagen con Google:", error.message);
        return 'Desconocido';
    }
}

export async function classifySubcategoryGoogle(imageUrl: string, candidateLabels: string[]): Promise<string> {
    return classifyLabelGoogle(imageUrl, candidateLabels);
}

export async function classifyPackagingFlexibilityGoogle(imageUrl: string, candidateLabels: string[]): Promise<string> {
    return classifyLabelGoogle(imageUrl, candidateLabels);
}
