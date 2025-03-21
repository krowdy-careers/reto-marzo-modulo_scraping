const express = require("express");
const cors = require("cors");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.paths = {
      extractData: "/api/extract-data",
      extractRange: "/api/extract-range",
      classifyPackaging: "/api/classify-packaging",
      saveCsv: "/api/save-csv",
      saveJson: "/api/save-json",
    };

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static("public"));
  }

  routes() {
    this.app.use(this.paths.extractData, require("../routes/extractData"));
    this.app.use(this.paths.extractRange, require("../routes/extractRange"));
    this.app.use(this.paths.classifyPackaging, require("../routes/classifyPackaging"));
    this.app.use(this.paths.saveCsv, require("../routes/saveCsv"));
    this.app.use(this.paths.saveJson, require("../routes/saveJson"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Web server listening on port", this.port);
    });
  }
}

module.exports = Server;
