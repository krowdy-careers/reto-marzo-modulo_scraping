const { request, response } = require("express");

const saveCsvPost = (req = request, res = response) => {
  const { id } = req.body;

  res.json({
    msg: "saveCsvPost",
    id,
  });
};

module.exports = {
  saveCsvPost,
};
