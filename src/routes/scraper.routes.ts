import { Server } from "restify";

import ScraperController from "../controllers/scraper.controller";

class ScraperRouter {
  static routes(server: Server) {
    server.get("/scrape-tottus", ScraperController.scrapePage);
  }
}

export default ScraperRouter;
