import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsString()
  @IsOptional()
  title?: string;
}
