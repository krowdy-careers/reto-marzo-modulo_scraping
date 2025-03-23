import restify from "restify";

export const createRestifyServer = () => {
  const server = restify.createServer({ name: "", version: "" });

  server.use(restify.plugins.queryParser());

  return server;
};
