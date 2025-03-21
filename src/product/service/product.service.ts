import { ProductDto } from '../dto/product.dto.js';

export class ProductoService {
  async isFlexible(productDto: ProductDto): Promise<ProductDto> {
    /* TO DO: Implement AI API */
    return { ...productDto, isFlexible: true };
  }
}
