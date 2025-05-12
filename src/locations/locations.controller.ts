import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // Country endpoints
  @Get('countries')
  findAllCountries() {
    return this.locationsService.findAllCountries();
  }

  @Get('countries/:id')
  findCountryById(@Param('id') id: string) {
    return this.locationsService.findCountryById(+id);
  }

  @Post('countries')
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationsService.createCountry(createCountryDto);
  }

  @Patch('countries/:id')
  updateCountry(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.locationsService.updateCountry(+id, updateCountryDto);
  }

  @Delete('countries/:id')
  removeCountry(@Param('id') id: string) {
    return this.locationsService.removeCountry(+id);
  }

  // City endpoints
  @Get('cities')
  findAllCities() {
    return this.locationsService.findAllCities();
  }

  @Get('countries/:id/cities')
  findCitiesByCountry(@Param('id') id: string) {
    return this.locationsService.findCitiesByCountry(+id);
  }

  @Get('cities/:id')
  findCityById(@Param('id') id: string) {
    return this.locationsService.findCityById(+id);
  }

  @Post('cities')
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationsService.createCity(createCityDto);
  }

  @Patch('cities/:id')
  updateCity(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.locationsService.updateCity(+id, updateCityDto);
  }

  @Delete('cities/:id')
  removeCity(@Param('id') id: string) {
    return this.locationsService.removeCity(+id);
  }
}