import { initCluster } from "./config/cluster";
import { createServer } from "./config/server";
import { scrapingRoutes } from "./routes/scraping.route";



(async () =>{

    const cluster=  await initCluster();
    const server = createServer();
    scrapingRoutes(server);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running in  http://localhost:${PORT}`);
    });


})();
