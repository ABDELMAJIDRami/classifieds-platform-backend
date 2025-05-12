import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateCountryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  code?: string;
}