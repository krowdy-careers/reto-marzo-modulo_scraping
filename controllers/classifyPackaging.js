const { request, response } = require("express");

const imageClassificationService = require("../services/imageClassificationService");

const classifyPackagingPost = async (req = request, res = response) => {
  const { apiKey, imageUrl } = req.body;

  const candidateLabels = ["rigid packaging", "flexible packaging"];

  try {
    const classificationResult = await imageClassificationService.classifyImage(
      apiKey,
      imageUrl,
      candidateLabels
    );
    res.status(200).json({ success: true, result: classificationResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  classifyPackagingPost,
};
