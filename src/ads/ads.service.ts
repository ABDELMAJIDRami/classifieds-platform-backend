import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from './entities/ad.entity';
import {AdStatus, AdVersion} from './entities/ad-version.entity';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { ModerateAdDto } from './dto/moderate-ad.dto';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { City } from '../locations/entities/city.entity';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private adsRepository: Repository<Ad>,
    @InjectRepository(AdVersion)
    private adVersionsRepository: Repository<AdVersion>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoriesRepository: Repository<Subcategory>,
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
  ) {}

  async findAll(filters?: { status?: AdStatus; userId?: number }): Promise<Ad[]> {
    const queryBuilder = this.adsRepository.createQueryBuilder('ad')
      .leftJoinAndSelect('ad.user', 'user')
      .leftJoinAndSelect('ad.category', 'category')
      .leftJoinAndSelect('ad.subcategory', 'subcategory')
      .leftJoinAndSelect('ad.city', 'city')
      .leftJoinAndSelect('city.country', 'country')
      .leftJoinAndSelect('ad.versions', 'versions')
      .leftJoinAndSelect('versions.moderator', 'moderator');

    if (filters?.userId) {
      queryBuilder.andWhere('ad.user.id = :userId', {userId: filters.userId});
    }

    if (filters?.status) {
      queryBuilder.andWhere('versions.status = :status', {status: filters.status});
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, userId?: number): Promise<Ad> {
    const ad = await this.adsRepository.findOne({
      where: {id},
      relations: [
        'user',
        'category',
        'subcategory',
        'city',
        'city.country',
        'versions',
        'versions.moderator'
      ],
    });

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    if (userId && ad.user.id !== userId) {
      throw new NotFoundException('You do not have permission to access this advertisement');
    }

    return ad;
  }

  async create(createAdDto: CreateAdDto, user: User): Promise<Ad> {
    // Validate category
    const category = await this.categoriesRepository.findOne({
      where: { id: createAdDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${createAdDto.categoryId} not found`);
    }

    // Validate subcategory if provided
    let subcategory: Subcategory | null = null;
    if (createAdDto.subcategoryId) {
      subcategory = await this.subcategoriesRepository.findOne({
        where: { 
          id: createAdDto.subcategoryId,
          category: { id: createAdDto.categoryId }
        },
        relations: ['category'],
      });
      if (!subcategory) {
        throw new NotFoundException(`Subcategory with ID ${createAdDto.subcategoryId} not found or does not belong to the specified category`);
      }
    }

    // Validate city
    const city = await this.citiesRepository.findOne({
      where: { id: createAdDto.cityId },
      relations: ['country'],
    });
    if (!city) {
      throw new NotFoundException(`City with ID ${createAdDto.cityId} not found`);
    }

    // Create new ad
    const ad = this.adsRepository.create({
      user: user,
      category: category,
      subcategory: subcategory ?? undefined,
      city: city,
    });

    const savedAd = await this.adsRepository.save(ad);

    // Create initial version
    const adVersion = this.adVersionsRepository.create({
      versionNumber: 1,
      title: createAdDto.title,
      description: createAdDto.description,
      price: createAdDto.price,
      status: AdStatus.PENDING,
      ad: savedAd,
    });

    await this.adVersionsRepository.save(adVersion);

    return this.findOne(savedAd.id);
  }

  async update(id: number, updateAdDto: UpdateAdDto, user: User): Promise<Ad> {
    const ad = await this.findOne(id);

    // Check if user is the owner of the ad
    if (ad.user.id !== user.id) {
      throw new BadRequestException('You can only update your own ads');
    }

    // Validate category if provided
    let category: Category | null = ad.category;
    if (updateAdDto.categoryId) {
      category = await this.categoriesRepository.findOne({
        where: { id: updateAdDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${updateAdDto.categoryId} not found`);
      }
    }

    // Validate subcategory if provided
    let subcategory: Subcategory | null = ad.subcategory;
    if (updateAdDto.subcategoryId) {
      subcategory = await this.subcategoriesRepository.findOne({
        where: { 
          id: updateAdDto.subcategoryId,
          category: { id: category.id }
        },
        relations: ['category'],
      });
      if (!subcategory) {
        throw new NotFoundException(`Subcategory with ID ${updateAdDto.subcategoryId} not found or does not belong to the specified category`);
      }
    }

    // Validate city if provided
    let city: City | null = ad.city;
    if (updateAdDto.cityId) {
      city = await this.citiesRepository.findOne({
        where: { id: updateAdDto.cityId },
        relations: ['country'],
      });
      if (!city) {
        throw new NotFoundException(`City with ID ${updateAdDto.cityId} not found`);
      }
    }
    
    // Check if last version is pending. if true, update it instead of creating a new one
    const lastVersion = ad.versions.reduce<AdVersion | null>((max, version) =>
        max === null || version.versionNumber > max.versionNumber ? version : max,
      null
    );
    if (lastVersion && lastVersion.status === AdStatus.PENDING) {
      // Update existing version
      lastVersion.title = updateAdDto.title ?? lastVersion.title;
      lastVersion.description = updateAdDto.description ?? lastVersion.description;
      lastVersion.price = updateAdDto.price ?? lastVersion.price;
      await this.adVersionsRepository.save(lastVersion);
    } else {
      // Create new version
      const newVersionNumber = ad.versions.length + 1;
      const adVersion = this.adVersionsRepository.create({
        versionNumber: newVersionNumber,
        title: updateAdDto.title,
        description: updateAdDto.description,
        price: updateAdDto.price,
        status: AdStatus.PENDING,
        ad: ad,
      });

      await this.adVersionsRepository.save(adVersion);
    }
    return this.findOne(id);
  }

  async moderate(id: number, versionId: number, moderateAdDto: ModerateAdDto, moderator: User): Promise<Ad> {
    const ad = await this.findOne(id);

    console.log('asdsadasdasdasdasd')
    console.log(ad)

    // Find version to moderate
    const versionToModerate = ad.versions.find(v => v.id === versionId);
    if (!versionToModerate) {
      throw new NotFoundException(`Version with ID ${versionId} for ad with ID ${id} not found`);
    }

    if (versionToModerate.status !== AdStatus.PENDING) {
      throw new BadRequestException(`Version ${versionId} for ad ${id} is not in pending status`);
    }

    versionToModerate.status = moderateAdDto.status;
    versionToModerate.moderator = moderator;

    if (moderateAdDto.status === AdStatus.REJECTED && moderateAdDto.rejectionReason) {
      versionToModerate.rejectionReason = moderateAdDto.rejectionReason;
    }

    await this.adVersionsRepository.save(versionToModerate);

    return this.findOne(id);
  }

  async remove(id: number, user: User): Promise<void> {
    const ad = await this.findOne(id);

    // Check if user is the owner of the ad
    if (ad.user.id !== user.id) {
      throw new BadRequestException('You can only delete your own ads');
    }

    // Soft delete by setting isActive to false
    ad.isActive = false;
    await this.adsRepository.save(ad);
  }

  async getPublicAds(): Promise<Ad[]> {
    return this.findAll({ status: AdStatus.APPROVED });
  }

  // async getPublicAd(): Promise<Ad[]> {
  //   return this.findOne({ status: AdStatus.APPROVED });
  // }

  async getUserAds(userId: number): Promise<Ad[]> {
    return this.findAll({ userId });
  }

  async getPendingAds(): Promise<Ad[]> {
    return this.findAll({ status: AdStatus.PENDING });
  }
}