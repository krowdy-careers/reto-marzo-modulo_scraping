const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Parser } = require("@json2csv/plainjs");

class FileService {
  async saveJsonToFile(data) {
    try {
      const filename = `products_${uuidv4()}.json`;

      const jsonString = JSON.stringify(data, null, 2);

      const filePath = path.join(__dirname, "..", "public", "files", "json", filename);

      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, jsonString, "utf8");

      return { success: true, filePath, filename };
    } catch (error) {
      throw new Error(`Failed to save JSON to file: ${error.message}`);
    }
  }

  async saveCsvToFile(data) {
    try {
      const filename = `products_${uuidv4()}.csv`;

      const json2csvParser = new Parser();
      const csvString = json2csvParser.parse(data);

      const filePath = path.join(__dirname, "..", "public", "files", "csv", filename);

      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, csvString, "utf8");

      return { success: true, filePath, filename };
    } catch (error) {
      throw new Error(`Failed to save CSV to file: ${error.message}`);
    }
  }
}

module.exports = new FileService();
