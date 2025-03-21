import restify from 'restify';
import { scrapeProductsTotus } from './services/scraper';
import fs from 'fs';
import { parse } from 'json2csv';


const server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

let apiKey = '';

// Endpoint para configurar la API Key
server.post('/set-api-key', (req, res, next) => {
  apiKey = req.body.apiKey;
  res.send({ message: 'API Key actualizada' });
  return next();
});

// Endpoint para descargar los datos en JSON o CSV
server.get('/download', async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const products = await scrapeProductsTotus("Asda");

    if (format === 'csv') {
      const csv = parse(products);
      fs.writeFileSync('products.csv', csv);
      res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    } else {
      const json = JSON.stringify(products, null, 2);
      fs.writeFileSync('products.json', json);
      res.setHeader('Content-Disposition', 'attachment; filename=products.json');
      res.setHeader('Content-Type', 'application/json');
      res.send(json);
    }
  } catch (error) {
    res.send(500, { error: 'Error al extraer los datos' });
  }
  return next();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
