const { request, response } = require("express");

const extractRangePost = (req = request, res = response) => {
  const { id } = req.body;

  res.json({
    msg: "extractRangePost",
    id,
  });
};

module.exports = {
  extractRangePost,
};
