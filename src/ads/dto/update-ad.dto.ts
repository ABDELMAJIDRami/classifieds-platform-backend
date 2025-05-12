import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateAdDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  subcategoryId?: number;

  @IsNumber()
  @IsOptional()
  cityId?: number;
}