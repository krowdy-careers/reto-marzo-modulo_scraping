const validateRange = (value, { req }) => {
  const startPage = parseInt(req.body.startPage);
  const endPage = parseInt(value);

  if (endPage < startPage) {
    throw new Error("End page must be greater than or equal to start page");
  }

  return true;
};

module.exports = validateRange;
