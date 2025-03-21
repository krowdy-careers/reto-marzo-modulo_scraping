const IA_API_KEY = 'TU_API_KEY';
const IA_API_URL = 'URL_DE_LA_API_DE_IA';

 export async function clasificarEmpaque(imagenUrl: string): Promise<boolean> {
  // Lógica para enviar la imagen a la API de IA y determinar si el empaque es flexible
  const response = await fetch(IA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${IA_API_KEY}`
    },
    body: JSON.stringify({ imageUrl: imagenUrl })
  });

  const data = await response.json();
  return data.isFlexible;
}
