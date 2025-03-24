import restify from "restify";
import dotenv from "dotenv";
import { createServer } from "./config/server";
import { tottusRoute } from "./routes/tottus.route";

dotenv.config();

(async () => {
    const server = createServer();
    tottusRoute(server);

    server.listen(process.env.PORT, () => {
        console.log(`Servidor en http://localhost:${process.env.PORT}`);
      });
})();

