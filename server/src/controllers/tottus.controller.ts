// src/controllers/tottus.controller.ts
import { Request, Response } from 'restify'; // Elimina 'Next'
import { TottusService } from '../services/tottus.service';

export const tottusScrapePage = async (req: Request, res: Response) => { // Sin 'next'
    const page = req.query.page;
    console.log(page);
    
    try {
        const data = await TottusService.getItemsByURL('https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa');
        res.send(200, data);
    } catch (error) {
        console.log(error);
        res.send(500, { error: (error as Error).message });
    }
};