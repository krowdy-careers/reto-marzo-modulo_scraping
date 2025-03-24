const axios = require('axios');

/**
 * Comprueba si Ollama está funcionando y obtiene información sobre el modelo
 * @param {Object} config Configuración de Ollama
 * @returns {Promise<boolean>} true si Ollama está operativo, false si no
 */
async function checkOllamaStatus(config) {
  if (!config.useOllama) {
    return false;
  }
  
  try {
    // Verificamos si los endpoints básicos están funcionando
    const tagsResponse = await axios.get(`${config.ollamaApiBase}/api/tags`, { timeout: 5000 });
    console.log('✅ Conexión con Ollama establecida correctamente');
    
    // Verificamos si nuestro modelo específico está disponible
    const tags = tagsResponse.data.models || [];
    
    // Buscar modelo exacto o por coincidencia parcial si está habilitado
    let modelAvailable = tags.some(model => model.name === config.model);
    
    if (!modelAvailable && config.allowPartialModelMatch) {
      // Extraer la parte base del nombre del modelo (antes de los dos puntos)
      const baseModelName = config.model.split(':')[0];
      
      // Buscar cualquier modelo que comience con la base
      const matchingModels = tags.filter(model => 
        model.name === baseModelName || 
        model.name.startsWith(`${baseModelName}:`) || 
        model.name.includes(baseModelName)
      );
      
      if (matchingModels.length > 0) {
        // Actualizar al primer modelo coincidente encontrado
        config.model = matchingModels[0].name;
        console.log(`🔄 Usando modelo disponible: ${config.model}`);
        modelAvailable = true;
      }
    }
    
    if (!modelAvailable) {
      console.warn(`⚠️ Modelo "${config.model}" no encontrado entre los modelos disponibles.`);
      console.log('📋 Modelos disponibles:', tags.map(m => m.name).join(', '));
      
      // Intentar usar el primer modelo disponible que podría tener capacidades de visión
      const visionModels = tags.filter(model => 
        model.name.includes('vision') || 
        model.name.includes('llava') || 
        model.name.includes('deepseek') ||
        model.name.includes('clip') ||
        model.name.includes('imagen')
      );
      
      if (visionModels.length > 0) {
        config.model = visionModels[0].name;
        console.log(`🔄 Intentando usar modelo alternativo con capacidades de visión: ${config.model}`);
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Ollama:', error.message);
    return false;
  }
}

module.exports = {
  checkOllamaStatus
};
