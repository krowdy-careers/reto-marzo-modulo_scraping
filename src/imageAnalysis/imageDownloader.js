const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Descarga una imagen desde una URL
 * @param {string} imageUrl URL de la imagen
 * @param {string} productId Identificador único para el producto
 * @param {string} tempDir Directorio temporal donde guardar la imagen
 * @returns {Promise<string|null>} Ruta del archivo guardado o null si hay error
 */
async function downloadImage(imageUrl, productId, tempDir) {
  if (!imageUrl || imageUrl === 'Sin imagen') {
    return null;
  }

  try {
    // Intentar formatear la URL si contiene caracteres problemáticos
    const formattedUrl = imageUrl.replace(/\s+/g, '%20');
    
    const imagePath = path.join(tempDir, `${productId}.jpg`);
    
    // Establecer opciones para la solicitud HTTP con timeout más largo y manejo de redirecciones
    const response = await axios({
      method: 'get',
      url: formattedUrl,
      responseType: 'stream',
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      }
    });

    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(imagePath));
      writer.on('error', (err) => {
        console.error(`Error escribiendo imagen ${productId}:`, err);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Error descargando imagen ${imageUrl}:`, error.message);
    
    // Si la URL contiene "cdn-cgi", intentar con una URL modificada
    if (imageUrl.includes('cdn-cgi')) {
      try {
        console.log(`🔄 Intentando URL alternativa para ${productId}...`);
        // Intentar con un formato diferente de la URL
        const altUrl = imageUrl
          .replace('/width=240,height=240,', '/width=320,height=320,')
          .replace('format=webp', 'format=jpg');
          
        const imagePath = path.join(tempDir, `${productId}.jpg`);
        const response = await axios({
          method: 'get',
          url: altUrl,
          responseType: 'stream',
          timeout: 15000
        });
        
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            console.log(`✅ Descarga alternativa exitosa para ${productId}`);
            resolve(imagePath);
          });
          writer.on('error', reject);
        });
      } catch (altError) {
        console.error(`Error en descarga alternativa para ${productId}:`, altError.message);
      }
    }
    
    return null;
  }
}

module.exports = {
  downloadImage
};
