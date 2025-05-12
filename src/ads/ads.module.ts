import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from './entities/ad.entity';
import { AdVersion } from './entities/ad-version.entity';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { City } from '../locations/entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ad, AdVersion, Category, Subcategory, City])],
  providers: [AdsService],
  controllers: [AdsController],
  exports: [AdsService],
})
export class AdsModule {}
