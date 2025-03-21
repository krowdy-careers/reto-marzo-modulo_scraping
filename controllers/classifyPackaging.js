const { request, response } = require("express");

const classifyPackagingPost = (req = request, res = response) => {
  const { id } = req.body;

  res.json({
    msg: "classifyPackagingPost",
    id,
  });
};

module.exports = {
  classifyPackagingPost,
};
