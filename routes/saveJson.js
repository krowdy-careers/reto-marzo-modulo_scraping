const { Router } = require("express");
const { saveJsonPost } = require("../controllers/saveJson");
const router = Router();

router.post("/", saveJsonPost);

module.exports = router;
