const { Router } = require("express");
const { check } = require("express-validator");

const validateRange = require("../helpers/rangeValidator");
const validateInput = require("../middlewares/validateInput");
const { extractRangePost } = require("../controllers/extractRange");

const router = Router();

router.post(
  "/",
  [
    check("startPage", "Start page is required").notEmpty(),
    check("startPage", "Start page must be a number").isNumeric(),
    check("startPage", "Start page must be greater than or equal to 1").isInt({ min: 1 }),
    check("endPage", "End page is required").notEmpty(),
    check("endPage", "End page must be a number").isNumeric(),
    check("endPage").custom(validateRange),
    validateInput,
  ],
  extractRangePost
);

module.exports = router;
