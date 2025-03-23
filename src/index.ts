import { createRestifyServer } from "./config/server";
import { PORT } from "./config/env";

import ScraperRouter from "./routes/scraper.routes";
import OpenAiRouter from "./routes/openai.routes";

const server = createRestifyServer();
const port = PORT || 8080;

ScraperRouter.routes(server);
OpenAiRouter.routes(server);

server.listen(port, () => {
  console.log(`Listening at port: ${port}`);
});
