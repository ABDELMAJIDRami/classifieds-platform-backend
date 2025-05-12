import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateSubcategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;
}