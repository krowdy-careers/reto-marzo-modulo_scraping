import { ProductDto } from '../dto/product.dto.js';
import { RawProductDto } from '../dto/raw-product.dto.js';

export class ProductoService {
  async processProduct(
    category: string,
    subcategory: string,
    rawProduct: RawProductDto,
  ): Promise<ProductDto> {
    /* TO DO: Process Data*/
    return {
      category: category.split('-')[0].trim(),
      subcategory: subcategory.trim(),
      name: rawProduct.name.trim(),
      brand: rawProduct.brand.trim(),
      image: rawProduct.image
        .trim()
        .replace(/w=\d+/, 'w=500')
        .replace(/h=\d+/, 'h=500')
        .replace(/fit=pad/, 'format=jpg'),
      isFlexible: await this.isFlexible(rawProduct),
    } as ProductDto;
  }

  private async isFlexible(rawProductDto: RawProductDto): Promise<boolean> {
    /* TO DO: Implement AI API */
    return rawProductDto.image ? true : false;
  }
}
