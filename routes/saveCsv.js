const { Router } = require("express");
const { saveCsvPost } = require("../controllers/saveCsv");
const router = Router();

router.post("/", saveCsvPost);

module.exports = router;
