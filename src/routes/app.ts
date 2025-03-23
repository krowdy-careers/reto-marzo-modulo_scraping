import express from "express";
import { scrape, scrapeAndClassify } from "../controllers/scrapeController";

export const app = express();

// Definir rutas
app.get("/", (_req, res) => {
  res.send("Hola mundo");
});

app.get("/scrape", scrape);
app.get("/scrape-and-classify", scrapeAndClassify);