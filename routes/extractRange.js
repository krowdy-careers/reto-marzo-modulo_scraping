const { Router } = require("express");
const { extractRangePost } = require("../controllers/extractRange");
const router = Router();

router.post("/", extractRangePost);

module.exports = router;
