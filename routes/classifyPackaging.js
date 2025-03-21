const { Router } = require("express");
const { classifyPackagingPost } = require("../controllers/classifyPackaging");
const router = Router();

router.post("/", classifyPackagingPost);

module.exports = router;
