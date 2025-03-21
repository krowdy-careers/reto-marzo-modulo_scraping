import { Next, Request, Response } from "restify";
import ScraperService from "../services/scraper.service";

const tottusUrl = "https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa";

class ScraperController {
  static async scrapePage(req: Request, res: Response, next: Next) {
    try {
      const data = await ScraperService.getAllItems(tottusUrl);

      res.send(200, { success: true, data: data });
    } catch (error) {
      console.log(error);
      res.send(500, { error: (error as Error).message });
    }

    return next();
  }
}

export default ScraperController;
