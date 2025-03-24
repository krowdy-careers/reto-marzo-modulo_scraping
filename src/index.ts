import { createServer } from './config/server';
import { screenshotRoutes } from './routers/screenshot.routers';
import { initCluster } from './config/cluster';

(async () => {
    const cluster = await initCluster();
    const server = createServer();
    screenshotRoutes(server);

    server.listen(8080, () => {
        console.log('%s listening at %s', server.name, server.url);
    });
})();