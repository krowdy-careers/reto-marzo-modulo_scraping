import dotenv from "dotenv";

import { initCluster, cluster } from "./config/cluster";
import { createServer } from "./config/server";
import { screenshotRoutes } from "./routes/screenshot.routes";

dotenv.config();
async function startServer() {
  try {
    await initCluster();
    const server = createServer();
    screenshotRoutes(server);

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
      console.log(`%s listening at http://localhost:%s`, server.name, port);
    });

    process.on("SIGINT", async () => {
      console.log("Cerrando servidor...");
      await cluster.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();
