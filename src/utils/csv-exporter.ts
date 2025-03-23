import { createObjectCsvWriter } from 'csv-writer';
import { ProductDto } from '../product/dto/product.dto.js';

export class CSVExporter {
  async exportarProductos(
    productos: ProductDto[],
    archivo: string,
  ): Promise<void> {
    const csvWriter = createObjectCsvWriter({
      path: archivo,
      header: [
        { id: 'category', title: 'category' },
        { id: 'subcategory', title: 'subcategory' },
        { id: 'name', title: 'name' },
        { id: 'brand', title: 'brand' },
        { id: 'image', title: 'image' },
        { id: 'isFlexible', title: 'isFlexible' },
      ],
    });

    const chunkSize = 100;
    for (let i = 0; i < productos.length; i += chunkSize) {
      const chunk = productos.slice(i, i + chunkSize);
      await csvWriter.writeRecords(chunk);
    }
  }
}
