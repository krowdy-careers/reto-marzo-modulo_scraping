const { request, response } = require("express");

const fileService = require("../services/fileService");

const saveCsvPost = async (req = request, res = response) => {
  const { data } = req.body;

  try {
    const result = await fileService.saveCsvToFile(data);

    const fileUrl = `/files/csv/${result.filename}`;

    res.status(200).json({
      success: true,
      message: "CSV saved successfully",
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
  saveCsvPost,
};
