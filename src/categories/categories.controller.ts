import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import {Role} from "../auth/decorators/role.decorator";
import {AuthenticatedGuard} from "../auth/guards/authenticated.guard";
import {RoleGuard} from "../auth/guards/role.guard";

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /* Category endpoints */
  @Get()
  findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Post()
  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Patch(':id')
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(+id, updateCategoryDto);
  }

  /* Subcategory endpoints */
  @Get('subcategories/all')
  findAllSubcategories() {
    return this.categoriesService.findAllSubcategories();
  }

  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('subcategories')
  createSubcategory(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.categoriesService.createSubcategory(createSubcategoryDto);
  }

  @Role('manager')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Patch('subcategories/:id')
  updateSubcategory(@Param('id') id: string, @Body() updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.categoriesService.updateSubcategory(+id, updateSubcategoryDto);
  }
}