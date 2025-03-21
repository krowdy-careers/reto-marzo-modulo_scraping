import { initCluster } from "./config/cluster";
import express from "express"; //* Configuración del servidor - express

export const server = express();
const PORT = process.env.PORT || 3000;
server.get("/", (_req, res) => {
  res.send("Hola mundo");
});

export const start = async () => {
  try {
    await initCluster();
    console.log(" 🚀 Scraper listo");
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
  }
};

start();
