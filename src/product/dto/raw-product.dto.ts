import { IsString, IsUrl } from 'class-validator';

export class RawProductDto {
  @IsString()
  name!: string;

  @IsString()
  brand!: string;

  @IsUrl()
  image!: string;
}
