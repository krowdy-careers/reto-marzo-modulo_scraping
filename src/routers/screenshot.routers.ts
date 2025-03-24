import { screenshotController,screenshotControllerJS,tottusScrapePage } from '../controllers/screenshot.controller';

export const screenshotRoutes = (server: any) => {
    server.get('/screenshot', screenshotController);
    server.get('/screenshotjson', screenshotControllerJS);
    server.get('/tottusscraping', tottusScrapePage);
};