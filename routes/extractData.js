const { Router } = require("express");
const { extractDataPost } = require("../controllers/extractData");
const router = Router();

router.post("/", extractDataPost);

module.exports = router;
