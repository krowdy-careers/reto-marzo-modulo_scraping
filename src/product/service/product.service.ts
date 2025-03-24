import { OpenAIUtil } from '../../utils/openai-util.js';
import { ProductDto } from '../dto/product.dto.js';
import { RawProductDto } from '../dto/raw-product.dto.js';

export class ProductoService {
  private cleanCategory(category: string): string {
    return category.split('-')[0].trim();
  }

  private cleanImageUrl(url: string): string {
    return url
      .trim()
      .replace(/w=\d+/, 'w=500')
      .replace(/h=\d+/, 'h=500')
      .replace(/fit=pad/, 'format=jpg');
  }

  async processProduct(
    category: string,
    subcategory: string,
    rawProduct: RawProductDto,
  ): Promise<ProductDto> {
    const imageUrl = this.cleanImageUrl(rawProduct.imageUrl);

    return {
      category: this.cleanCategory(category),
      subcategory: subcategory.trim(),
      name: rawProduct.name.trim(),
      brand: rawProduct.brand.trim(),
      imageUrl: imageUrl,
      isFlexible: await this.isFlexible(imageUrl),
    } as ProductDto;
  }

  private async isFlexible(imageUrl: string): Promise<boolean> {
    const prompt =
      'Is the object in the image flexible? Answer only with true or false.\nAnswer: true or false';

    const response = await OpenAIUtil.getInstance().generateResponse(
      prompt,
      imageUrl,
    );
    return response.toLowerCase() === 'true';
  }
}
