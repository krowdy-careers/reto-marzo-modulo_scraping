import { Server } from "restify";
import { totusScrapePage } from "../controllers/screenshot.controller";

export const screenshotRoutes = (server: Server): void => {
  server.get("/totusScrape", totusScrapePage);
};
