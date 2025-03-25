const fs = require("fs");
const { parse } = require("json2csv");

async function saveData(data, jsonPath, csvPath) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Los datos no pueden estar vacíos.");
    }

    // Guardar como JSON
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

    // Guardar como CSV
    const csv = parse(data, { fields: Object.keys(data[0]) });
    fs.writeFileSync(csvPath, csv);

    console.log("Datos guardados correctamente.");
  } catch (error) {
    console.error("Error al guardar los datos:", error);
  }
}

module.exports = saveData;
