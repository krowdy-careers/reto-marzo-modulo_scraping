import { Next, Request, Response } from "restify";
import OpenAiService from "../services/openai.service";

class OpenAiController {
  static async flexiblePackage(req: Request, res: Response, next: Next) {
    try {
      const { imageUrl } = req.query;

      const response = await OpenAiService.isFlexiblePackage(imageUrl);

      res.send(200, { resullt: response });
    } catch (error: any) {
      console.log(error);

      res.send(500, { error: (error as Error).message, success: false });
    }

    return next();
  }
}

export default OpenAiController;
