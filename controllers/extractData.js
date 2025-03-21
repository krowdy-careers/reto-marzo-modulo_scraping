const { request, response } = require("express");

const extractDataPost = (req = request, res = response) => {
  const { id } = req.body;

  res.json({
    msg: "extractDataPost",
    id,
  });
};

module.exports = {
  extractDataPost,
};
