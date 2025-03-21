const { request, response } = require("express");

const saveJsonPost = (req = request, res = response) => {
  const { id } = req.body;

  res.json({
    msg: "saveJsonPost",
    id,
  });
};

module.exports = {
  saveJsonPost,
};
