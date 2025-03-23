import { initCluster } from "./config/cluster";
import { app } from "./routes/app";

const PORT = process.env.PORT || 3000;

export const start = async () => {
  try {
    await initCluster();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
  }
};

start();