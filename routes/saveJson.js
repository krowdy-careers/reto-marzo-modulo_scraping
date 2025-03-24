const { Router } = require("express");
const { check } = require("express-validator");

const validateInput = require("../middlewares/validateInput");
const { saveJsonPost } = require("../controllers/saveJson");

const router = Router();

router.post(
  "/",
  [
    check("data", "Data is required").notEmpty(),
    check("data", "Data must be a valid JSON array").isArray(),
    validateInput,
  ],
  saveJsonPost
);

module.exports = router;
