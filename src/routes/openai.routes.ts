import { Server } from "restify";

import OpenAiController from "../controllers/openai.controller";

class OpenAiRouter {
  static routes(server: Server) {
    server.get("/openai", OpenAiController.flexiblePackage);
  }
}

export default OpenAiRouter;
