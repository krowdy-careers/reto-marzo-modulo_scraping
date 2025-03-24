import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/constants";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeImageFromBase64(
    imageBase64: string,
    mimeType: string,
    prompt: string
  ): Promise<string | null> {
    try {
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      if (error.status === 429 || error.response?.status === 429) {
        console.log(
          "Límite de solicitudes alcanzado. Continuando con el scraping..."
        );
        return null;
      } else {
        console.error("Error analizando la imagen:", error);
        throw error;
      }
    }
  }
}

export default new GeminiService();
