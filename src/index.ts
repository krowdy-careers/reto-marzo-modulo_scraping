import dotenv from "dotenv";

import { createRestifyServer } from "./config/server";
import ScraperRouter from "./routes/scraper.routes";
// import PuppeteerCluster from "./config/cluster";

dotenv.config();

async function main() {
  // await PuppeteerCluster.initCluster();

  const server = createRestifyServer();

  ScraperRouter.routes(server);

  server.listen(process.env.PORT, () => {
    console.log(`Listening at port: ${process.env.PORT}`);
  });
}

main();
