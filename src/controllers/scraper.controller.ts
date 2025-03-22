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

      res.send(200, { data: data, success: true });
    } catch (error: any) {
      console.log(error);

      res.send(500, { error: (error as Error).message, success: false });
    }

    return next();
  }
}

export default ScraperController;
