const fs = require('fs');
const axios = require('axios');
const { checkOllamaStatus } = require('../utils/ollamaUtils');

/**
 * Cuenta las coincidencias de palabras clave en un texto
 * @param {string} text Texto a analizar
 * @param {string[]} keywords Lista de palabras clave
 * @returns {number} Número de coincidencias
 */
function countKeywordMatches(text, keywords) {
  return keywords.reduce((count, word) => {
    return count + (text.includes(word) ? 1 : 0);
  }, 0);
}

/**
 * Analiza si el empaque del producto es flexible usando exclusivamente el modelo DeepSeek
 * @param {string} imagePath Ruta al archivo de imagen
 * @param {string} productName Nombre del producto para contexto
 * @param {Object} config Configuración para Ollama
 * @returns {Promise<string>} "Flexible" o "Rígido" o "No determinado"
 */
async function analyzePackaging(imagePath, productName, config) {
  // Si no hay imagen, no podemos hacer análisis visual
  if (!imagePath) {
    console.log(`⚠️ No hay imagen disponible para ${productName}. Retornando "No determinado".`);
    return "No determinado";
  }

  try {
    // Verificar si Ollama está activo
    const ollamaActive = await checkOllamaStatus(config);
    if (!ollamaActive) {
      console.log('❌ Ollama no está disponible. No se puede realizar análisis visual.');
      return "No determinado";
    }
    
    // Leer la imagen y convertirla a base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Mejorar el prompt para reducir ambigüedad y sesgo
    const prompt = `Esta es una imagen de un producto de supermercado llamado "${productName}". 

Clasifica con precisión el tipo de empaque visible en la imagen: 
- Si el empaque es flexible (como bolsas plásticas, sachets, doypack o envases que se pueden doblar o deformar fácilmente) responde únicamente "Flexible".
- Si el empaque es rígido (como botellas, frascos, latas, cajas duras, o envases que mantienen su forma) responde únicamente "Rígido".

Responde solamente con una palabra: "Flexible" o "Rígido".`;

    try {
      // Intentar con el endpoint de chat primero para mejor rendimiento con imágenes
      const response = await axios.post(`${config.ollamaApiBase}/api/chat`, {
        model: config.model,
        messages: [
          {
            role: "user",
            content: prompt,
            images: [base64Image]
          }
        ],
        stream: false,
        options: {
          temperature: 0.1 // Temperatura baja para respuestas más deterministas
        }
      }, { timeout: 30000 });
      
      console.log(`✅ Análisis de imagen exitoso para ${productName}`);
      
      // Extraer la respuesta del modelo
      const result = response.data.message?.content.trim() || '';
      console.log(`🤖 Respuesta de DeepSeek: "${result}"`);
      
      // Extraer la última palabra de la respuesta para mayor precisión
      const lastWord = result.split(/\s+/).pop().toLowerCase().trim();
      
      console.log(`🔍 Palabra clave detectada: "${lastWord}"`);
      
      // Verificar si la respuesta contiene exactamente "rígido" o "rigido"
      if (lastWord === "rígido" || lastWord === "rigido") {
        console.log(`✅ Clasificación determinada: Rígido`);
        return "Rígido";
      }
      
      // Verificar si la respuesta contiene exactamente "flexible"
      if (lastWord === "flexible") {
        console.log(`✅ Clasificación determinada: Flexible`);
        return "Flexible";
      }
      
      // Si llegamos aquí, intentar analizar el texto completo
      console.log(`⚠️ Palabra clave no detectada claramente. Analizando texto completo...`);
      
      const resultLower = result.toLowerCase();
      
      // Buscar primero menciones exactas
      if (resultLower.includes("rígido") || resultLower.includes("rigido")) {
        console.log(`✅ Clasificación determinada por análisis de texto: Rígido`);
        return "Rígido";
      }
      
      if (resultLower.includes("flexible")) {
        console.log(`✅ Clasificación determinada por análisis de texto: Flexible`);
        return "Flexible";
      }
      
      // Si aún no hay resultado, analizar palabras clave
      const flexibleScore = countKeywordMatches(resultLower, [
        'bolsa', 'sachet', 'doypack', 'blando', 'suave', 
        'plástico flexible', 'deformable'
      ]);
      
      const rigidScore = countKeywordMatches(resultLower, [
        'botella', 'frasco', 'lata', 'caja', 'duro', 
        'envase rígido', 'vidrio', 'metal'
      ]);
      
      console.log(`📊 Puntuación - Flexible: ${flexibleScore}, Rígido: ${rigidScore}`);
      
      if (rigidScore > flexibleScore) {
        console.log(`✅ Clasificación determinada por palabras clave: Rígido`);
        return "Rígido";
      } else if (flexibleScore > rigidScore) {
        console.log(`✅ Clasificación determinada por palabras clave: Flexible`);
        return "Flexible";
      } else {
        console.log(`⚠️ No se pudo determinar claramente. Resultado: No determinado`);
        return "No determinado";
      }
      
    } catch (chatError) {
      console.error(`Error con API de chat: ${chatError.message}`);
      
      // Si falla el endpoint de chat, intentamos con el endpoint de generate
      try {
        const response = await axios.post(`${config.ollamaApiBase}/api/generate`, {
          model: config.model,
          prompt: prompt,
          stream: false,
          images: [base64Image]
        }, { timeout: 30000 });
        
        const result = response.data.response.trim();
        console.log(`🤖 Respuesta de DeepSeek (generate): "${result}"`);
        
        // Aplicar la misma lógica mejorada para el endpoint generate
        const lastWord = result.split(/\s+/).pop().toLowerCase().trim();
        
        if (lastWord === "rígido" || lastWord === "rigido") {
          return "Rígido";
        }
        
        if (lastWord === "flexible") {
          return "Flexible";
        }
        
        // Resto del análisis similar al anterior
        const resultLower = result.toLowerCase();
        
        if (resultLower.includes("rígido") || resultLower.includes("rigido")) {
          return "Rígido";
        }
        
        if (resultLower.includes("flexible")) {
          return "Flexible";
        }
        
        // Análisis por palabras clave
        const flexibleScore = countKeywordMatches(resultLower, [
          'bolsa', 'sachet', 'doypack', 'blando', 'suave', 
          'plástico flexible', 'deformable'
        ]);
        
        const rigidScore = countKeywordMatches(resultLower, [
          'botella', 'frasco', 'lata', 'caja', 'duro', 
          'envase rígido', 'vidrio', 'metal'
        ]);
        
        if (rigidScore > flexibleScore) {
          return "Rígido";
        } else if (flexibleScore > rigidScore) {
          return "Flexible";
        } else {
          return "No determinado";
        }
      } catch (generateError) {
        console.error(`Error con API de generate: ${generateError.message}`);
        return "No determinado";
      }
    }
  } catch (error) {
    console.error(`Error analizando imagen ${imagePath}:`, error.message);
    return "No determinado";
  }
}

module.exports = {
  analyzePackaging,
  countKeywordMatches
};
