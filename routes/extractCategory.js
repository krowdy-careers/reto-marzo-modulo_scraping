const { Router } = require("express");
const { check } = require("express-validator");

const validateInput = require("../middlewares/validateInput");
const { extractCategoryPost } = require("../controllers/extractCategory");

const router = Router();

router.post(
  "/",
  [
    check("productUrl", "Product URL is required").notEmpty(),
    check("productUrl", "Product URL must be a valid URL").isURL(),
    validateInput,
  ],
  extractCategoryPost
);

module.exports = router;
