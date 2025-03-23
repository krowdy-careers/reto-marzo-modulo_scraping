import { OpenAIUtil } from '../../utils/openai-util.js';
import { ProductDto } from '../dto/product.dto.js';
import { RawProductDto } from '../dto/raw-product.dto.js';

export class ProductoService {
  private openaiUtil: OpenAIUtil;

  constructor() {
    this.openaiUtil = new OpenAIUtil();
  }

  async processProduct(
    category: string,
    subcategory: string,
    rawProduct: RawProductDto,
  ): Promise<ProductDto> {
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
    const prompt =
      'Is the object in the image flexible? Answer only with true or false.\nAnswer: true or false';
    const response = await this.openaiUtil.generateResponse(
      prompt,
      rawProductDto.image,
    );
    console.log(response);
    return response.toLowerCase() === 'true';
  }
}
