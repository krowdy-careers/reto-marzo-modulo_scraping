// src/services/vision.service.ts
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Product } from '../models/product.model';
import dotenv from 'dotenv';

dotenv.config();

export class VisionService {
  private static client = new ImageAnnotatorClient({
    keyFilename: process.env.CREDENTIALS_PATH
  });

  static async analyzePackaging(products: Product[]): Promise<Product[]> {
    return await Promise.all(products.map(async product => ({
      ...product,
      empaqueFlexible: await this.detectFlexiblePackaging(product.image)
    })));
  }

  private static async detectFlexiblePackaging(imageUrl: string): Promise<string> {
    try {
      if (!imageUrl.startsWith('http')) return 'No';
      
      const [result] = await this.client.labelDetection(imageUrl);
      const labels = result.labelAnnotations || [];
      
      const flexible = labels.some(label => 
        ['flexible packaging', 'plastic', 'pouch', 'sachet', 'film', 'bag']
          .some(keyword => 
            label.description?.toLowerCase().includes(keyword) && 
            (label.score || 0) > 0.7
          )
      );

      return flexible ? 'Sí' : 'No';
    } catch (error) {
      console.error(`Error analizando ${imageUrl}:`, error.message);
      return 'Desconocido';
    }
  }
}