import express from "express";
import { scrape, classify } from "../controllers/scrapeController";

export const app = express();

// Definir rutas
app.get("/", (req, res) => {
  res.send("🚀 Servidor corriendo en http://localhost:3000");
});
app.get("/scrape", scrape);
app.get("/classify", classify);