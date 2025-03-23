import { Next, Request, Response } from "restify";
import fs from "fs";

import ScraperService from "../services/scraper.service";

const tottusUrl = "https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa";

class ScraperController {
  static async scrapePage(req: Request, res: Response, next: Next) {
    try {
      const data = await ScraperService.getAllItems(tottusUrl);

      fs.writeFile("data.json", JSON.stringify(data), function (err) {
        if (err) console.log(err);
      });

      res.send(200, { success: true, data: data });
    } catch (error: any) {
      console.error(error);

      res.send(500, { success: false, error: (error as Error).message });
    }

    return next();
  }
}

export default ScraperController;
