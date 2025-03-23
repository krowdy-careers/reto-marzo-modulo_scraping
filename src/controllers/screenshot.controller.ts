import { Request, Response } from 'restify';
import { TottusService } from '../services/tottus.service';
import path from 'path';
import { promises as fs } from 'fs'



export const tottusScrapePage = async (req: Request, res: Response) => {
  const page = req.query.page;
  console.log(page);
  if (!page) {
    return res.send(400, { error: 'Page is required' });
  }
 
   try {

    const baseUrl = `https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa`;
    
    // Obtener el número total de páginas
    const totalPages = await TottusService.getLastPage(baseUrl);
    console.log('Total de páginas:', totalPages);
    
    const promises = [];
    for (let i = 1; i <= 4; i++) { 
      // Construir la URL con el número de página (Por temas de velocidad, solo se hacen 4 peticiones pero se puede cambiar el 4 por totalPages)
      const urlWithPage = `${baseUrl}?subdomain=tottus&page=${i}&store=tottus`;
      promises.push(TottusService.getItemsbyURL(urlWithPage));
    }
    const data = await Promise.all(promises);

   // Convertimos y Guardarmos en Json
      const jsonData = JSON.stringify(data, null, 2);
      const filePath = path.resolve(__dirname, '../data/tottusData.json');
      await fs.mkdir(path.resolve(__dirname, '../data'), { recursive: true });
      await fs.writeFile(filePath, jsonData, 'utf8');

        return res.send(200, data);
  } catch (error) {
    console.log(error);
    return res.send(500, { error: (error as Error).message });
  }
};

