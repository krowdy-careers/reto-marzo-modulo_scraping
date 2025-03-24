const { request, response } = require("express");

const fileService = require("../services/fileService");

const saveJsonPost = async (req = request, res = response) => {
  const { data } = req.body;

  try {
    const result = await fileService.saveJsonToFile(data);

    const fileUrl = `/files/json/${result.filename}`;

    res.status(200).json({
      success: true,
      message: "JSON saved successfully",
      fileUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  saveJsonPost,
};
