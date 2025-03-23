import { Next, Request, Response } from "restify";

import OpenAiService from "../services/openai.service";

class OpenAiController {
  static async flexiblePackage(req: Request, res: Response, next: Next) {
    try {
      const { imageUrl } = req.query;

      if (!imageUrl) throw new Error("You need to pass an imageUrl as query parameter");

      const response = await OpenAiService.isFlexiblePackage(imageUrl);

      res.send(200, { success: true, isFlexible: response, imageUrl: imageUrl });
    } catch (error: any) {
      console.error(error);

      res.send(500, { success: false, error: (error as Error).message });
    }

    return next();
  }
}

export default OpenAiController;
