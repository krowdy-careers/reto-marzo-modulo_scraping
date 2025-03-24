const cluster = require("cluster");
const http = require("http");
const { scrapeProducts } = require("../services/scraper");
const { analyzeImage } = require("../services/imageAnalysis");

const PORT = 3000;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  for (let i = 0; i < 2; i++) cluster.fork();
} else {
  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/scrape" && req.method === "GET") {
      const products = await scrapeProducts();
      for (let product of products) {
        const result = await analyzeImage(product.imagen);
        product.empaque_flexible = result.flexible;
        product.texto_detectado = result.textoDetectado;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(products));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  server.listen(PORT, () =>
    console.log(`Worker ${process.pid} running on port ${PORT}`)
  );
}
