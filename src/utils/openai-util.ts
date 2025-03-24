import OpenAI from 'openai';

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

      if (!completion.choices || completion.choices.length === 0) {
        throw new Error('No choices returned from OpenAI');
      }

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Error interacting with OpenAI:', error);
      return '{}';
    }
  }
}
