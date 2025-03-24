import { IsString, IsUrl, IsBoolean } from 'class-validator';

export class ProductDto {
  @IsString()
  category!: string;

  @IsString()
  subcategory!: string;

  @IsString()
  name!: string;

  @IsString()
  brand!: string;

  @IsUrl()
  imageUrl!: string;

  @IsBoolean()
  isFlexible!: boolean;
}
