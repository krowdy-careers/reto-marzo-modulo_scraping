import { tottusScrapePage } from '../controllers/screenshot.controller';

export const screenshotRoutes = (server: any) => {
    
    server.get('/tottusscraping', tottusScrapePage);
};
