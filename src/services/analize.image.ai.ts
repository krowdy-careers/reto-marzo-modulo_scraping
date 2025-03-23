
// use chatGPT for know if packing of products is flexible
export async function clasificarEmpaque(imagenUrl: string, nombreProducto: string, apiKey: string): Promise<boolean> {
  let prompt = imagenUrl !== 'none' 
      ? `Analiza la imagen y responde si el empaque es flexible. Responde "true" o "false". Imagen: ${imagenUrl}`
      : `Basado en el nombre del producto "${nombreProducto}", responde si el empaque es flexible. Responde "true" o "false".`;

  try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
              model: "gpt-4-turbo",
              messages: [{ role: "user", content: prompt }],
              temperature: 0
          })
      });

      const data = await response.json();
      const respuesta = data.choices?.[0]?.message?.content?.trim().toLowerCase();
      return respuesta === "true";
  } catch (error) {
      console.error("Error al clasificar empaque:", error);
      return false;
  }
}
