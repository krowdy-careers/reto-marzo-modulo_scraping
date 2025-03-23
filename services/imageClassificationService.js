const { HfInference } = require("@huggingface/inference");
const axios = require("axios");

class ImageClassificationService {
  _arrayBufferToBlob(arrayBuffer, mimeType) {
    return new Blob([arrayBuffer], { type: mimeType });
  }

  async _fetchImageAsArrayBuffer(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch image: ${error.message}`);
    }
  }

  async classifyImage(apiKey, imageUrl, candidateLabels) {
    try {
      const hf = new HfInference(apiKey);
      const MODEL_NAME = "openai/clip-vit-base-patch32";

      const imageArrayBuffer = await this._fetchImageAsArrayBuffer(imageUrl);

      const imageBlob = this._arrayBufferToBlob(imageArrayBuffer, "image/jpeg");

      const response = await hf.zeroShotImageClassification({
        model: MODEL_NAME,
        inputs: imageBlob,
        parameters: { candidate_labels: candidateLabels },
      });

      return response;
    } catch (error) {
      throw new Error(`Error classifying image: ${error.message}`);
    }
  }
}

module.exports = new ImageClassificationService();
