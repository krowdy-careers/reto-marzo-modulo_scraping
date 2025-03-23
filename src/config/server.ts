import * as restify from 'restify';

export const createServer = () => {
    const server = restify.createServer({ name: 'PuppeteerClusterAPI', version: '1.0.0' });
    server.timeout = 300000;
    
    server.use(restify.plugins.queryParser());
    return server;
};
