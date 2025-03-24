import { tottusScrapePage } from '../controllers/tottus.controller';

export const tottusRoute = (server: any) => {
    
    server.get('/scrape', tottusScrapePage);
};
