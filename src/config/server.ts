
import * as restify from 'restify'

// create the server
export const createServer=()=>{

    const server =restify.createServer({name:"a",version:"1.0.0"});
    server.timeout=30000;

    server.use(restify.plugins.queryParser());
    return server;
}