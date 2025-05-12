import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoriesRepository: Repository<Subcategory>,
  ) {}

  // Category methods
  async findAllCategories(): Promise<Category[]> {
    return this.categoriesRepository.find({
      relations: ['subcategories'],
    });
  }

  async findCategoryById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['subcategories'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with the same name already exists
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException(`Category with name '${createCategoryDto.name}' already exists`);
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findCategoryById(id);

    // Check if new name is already taken by another category
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException(`Category with name '${updateCategoryDto.name}' already exists`);
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  // Subcategory methods
  async findAllSubcategories(): Promise<Subcategory[]> {
    return this.subcategoriesRepository.find({
      relations: ['category'],
    });
  }

  async findSubcategoryById(id: number): Promise<Subcategory> {
    const subcategory = await this.subcategoriesRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }

    return subcategory;
  }

  async createSubcategory(createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    // Check if parent category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: createSubcategoryDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createSubcategoryDto.categoryId} not found`);
    }

    // Check if subcategory with the same name already exists in this category
    const existingSubcategory = await this.subcategoriesRepository.findOne({
      where: { 
        name: createSubcategoryDto.name,
        category: { id: createSubcategoryDto.categoryId }
      },
      relations: ['category'],
    });

    if (existingSubcategory) {
      throw new BadRequestException(`Subcategory with name '${createSubcategoryDto.name}' already exists in this category`);
    }

    const subcategory = this.subcategoriesRepository.create({
      name: createSubcategoryDto.name,
      description: createSubcategoryDto.description,
      category: category,
    });

    return this.subcategoriesRepository.save(subcategory);
  }

  async updateSubcategory(id: number, updateSubcategoryDto: UpdateSubcategoryDto): Promise<Subcategory> {
    const subcategory = await this.findSubcategoryById(id);
    
    let category: Category | null = subcategory.category;
    
    // If categoryId is provided, check if the new parent category exists
    if (updateSubcategoryDto.categoryId) {
      category = await this.categoriesRepository.findOne({
        where: { id: updateSubcategoryDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateSubcategoryDto.categoryId} not found`);
      }
    }

    // Check if new name is already taken by another subcategory in the same category
    if (updateSubcategoryDto.name && updateSubcategoryDto.name !== subcategory.name) {
      const existingSubcategory = await this.subcategoriesRepository.findOne({
        where: { 
          name: updateSubcategoryDto.name,
          category: { id: category.id }
        },
        relations: ['category'],
      });

      if (existingSubcategory && existingSubcategory.id !== id) {
        throw new BadRequestException(`Subcategory with name '${updateSubcategoryDto.name}' already exists in this category`);
      }
    }

    // Update subcategory
    if (updateSubcategoryDto.name) {
      subcategory.name = updateSubcategoryDto.name;
    }
    
    if (updateSubcategoryDto.description !== undefined) {
      subcategory.description = updateSubcategoryDto.description;
    }
    
    subcategory.category = category;

    return this.subcategoriesRepository.save(subcategory);
  }
}