const { Router } = require("express");
const { check } = require("express-validator");

const validateInput = require("../middlewares/validateInput");
const { extractDataPost } = require("../controllers/extractData");

const router = Router();

router.post(
  "/",
  [
    check("page", "Page number is required").notEmpty(),
    check("page", "Page number must be a number").isNumeric(),
    check("page", "Page number must be greater than or equal to 1").isInt({
      min: 1,
    }),
    validateInput,
  ],
  extractDataPost
);

module.exports = router;
