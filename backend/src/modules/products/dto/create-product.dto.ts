// create-product.dto.ts
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
export class CreateProductDto {
  @IsString()
  name: string;
  @IsString()
  slug: string;
  @IsString()
  description: string;
  @IsNumber()
  price: number;
  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;
  @IsOptional()
  @IsArray()
  images?: string[];
  @IsString()
  categoryId: string;
  @IsOptional()
  @IsString()
  brand?: string;
  @IsOptional()
  @IsNumber()
  stock?: number;
}