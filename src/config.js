const path = require("path");

// Ruta absoluta al archivo config.json en la raíz del proyecto
const GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  __dirname,
  "..",
  "config.json"
);

module.exports = { GOOGLE_APPLICATION_CREDENTIALS };
