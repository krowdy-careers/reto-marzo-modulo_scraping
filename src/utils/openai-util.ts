import OpenAI from 'openai';
import { ERROR_MESSAGES } from './messages.js';

export class OpenAIUtil {
  private static instance: OpenAIUtil;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({
      baseURL: process.env.DOMAIN || '',
      apiKey: process.env.API_KEY || '',
    });
  }

  public static getInstance(): OpenAIUtil {
    if (!OpenAIUtil.instance) {
      OpenAIUtil.instance = new OpenAIUtil();
    }
    return OpenAIUtil.instance;
  }

  async generateResponse(prompt: string, imageUrl: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.MODEL || '',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error(ERROR_MESSAGES.openAIInteraction, error);
      return '';
    }
  }
}
