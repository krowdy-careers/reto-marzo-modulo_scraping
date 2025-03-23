import OpenAI from "openai";

import { OPENAI_API_KEY } from "../config/env";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });


class OpenAiService {
  /**
   * Determines if a product package is flexible or not using OpenAI Vision API
   * @param imageUrl The URL of the product image
   * @returns {Promise<boolean>} True if the package is flexible, false otherwise
   */
  static async isFlexiblePackage(imageUrl: string): Promise<boolean> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI that determines if a product package is flexible or rigid based on its image.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Does this product have flexible packaging? Reply only with 'yes' or 'no'.",
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 5,
      });

      const result = response.choices[0]?.message?.content?.toLowerCase();

      return result === "yes";
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default OpenAiService;
