const { Router } = require("express");
const { check } = require("express-validator");

const validateInput = require("../middlewares/validateInput");
const { classifyPackagingPost } = require("../controllers/classifyPackaging");

const router = Router();

router.post(
  "/",
  [
    check("apiKey", "API Key is required").notEmpty(),
    check("imageUrl", "Image URL is required").notEmpty(),
    check("imageUrl", "Image URL must be a valid URL").isURL(),
    validateInput,
  ],
  classifyPackagingPost
);

module.exports = router;
