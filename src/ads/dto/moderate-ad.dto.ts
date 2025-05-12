import { IsEnum, IsString, IsOptional } from 'class-validator';
import {AdStatus} from "../entities/ad-version.entity";

export class ModerateAdDto {
  @IsEnum(AdStatus)
  status: AdStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}