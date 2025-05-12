import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {FindOptionsWhere, Repository} from 'typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Country)
    private countriesRepository: Repository<Country>,
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
  ) {}

  // Country methods
  async findAllCountries(): Promise<Country[]> {
    return this.countriesRepository.find({
      relations: ['cities'],
    });
  }

  async findCountryById(id: number): Promise<Country> {
    const country = await this.countriesRepository.findOne({
      where: { id },
      relations: ['cities'],
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    // Check if country with the same name or code already exists
    const existingCountry = await this.countriesRepository.findOne({
      where: [
        { name: createCountryDto.name },
        { code: createCountryDto.code },
      ],
    });

    if (existingCountry) {
      if (existingCountry.name === createCountryDto.name) {
        throw new BadRequestException(`Country with name '${createCountryDto.name}' already exists`);
      } else {
        throw new BadRequestException(`Country with code '${createCountryDto.code}' already exists`);
      }
    }

    const country = this.countriesRepository.create(createCountryDto);
    return this.countriesRepository.save(country);
  }

  async updateCountry(id: number, updateCountryDto: UpdateCountryDto): Promise<Country> {
    const country = await this.findCountryById(id);

    // Check if new name or code is already taken by another country
    if (updateCountryDto.name || updateCountryDto.code) {
      const conditions: FindOptionsWhere<Country>[] = [];
      
      if (updateCountryDto.name && updateCountryDto.name !== country.name) {
        conditions.push({ name: updateCountryDto.name });
      }
      
      if (updateCountryDto.code && updateCountryDto.code !== country.code) {
        conditions.push({ code: updateCountryDto.code });
      }
      
      if (conditions.length > 0) {
        const existingCountry = await this.countriesRepository.findOne({
          where: conditions,
        });

        if (existingCountry && existingCountry.id !== id) {
          if (updateCountryDto.name && existingCountry.name === updateCountryDto.name) {
            throw new BadRequestException(`Country with name '${updateCountryDto.name}' already exists`);
          } else {
            throw new BadRequestException(`Country with code '${updateCountryDto.code}' already exists`);
          }
        }
      }
    }

    Object.assign(country, updateCountryDto);
    return this.countriesRepository.save(country);
  }

  async removeCountry(id: number): Promise<void> {
    const country = await this.findCountryById(id);
    
    // Check if country has cities
    if (country.cities && country.cities.length > 0) {
      throw new BadRequestException(`Cannot delete country with ID ${id} because it has cities`);
    }
    
    await this.countriesRepository.remove(country);
  }

  // City methods
  async findAllCities(): Promise<City[]> {
    return this.citiesRepository.find({
      relations: ['country'],
    });
  }

  async findCitiesByCountry(countryId: number): Promise<City[]> {
    return this.citiesRepository.find({
      where: { country: { id: countryId } },
      relations: ['country'],
    });
  }

  async findCityById(id: number): Promise<City> {
    const city = await this.citiesRepository.findOne({
      where: { id },
      relations: ['country'],
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async createCity(createCityDto: CreateCityDto): Promise<City> {
    // Check if parent country exists
    const country = await this.countriesRepository.findOne({
      where: { id: createCityDto.countryId },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${createCityDto.countryId} not found`);
    }

    // Check if city with the same name already exists in this country
    const existingCity = await this.citiesRepository.findOne({
      where: { 
        name: createCityDto.name,
        country: { id: createCityDto.countryId }
      },
      relations: ['country'],
    });

    if (existingCity) {
      throw new BadRequestException(`City with name '${createCityDto.name}' already exists in this country`);
    }

    const city = this.citiesRepository.create({
      name: createCityDto.name,
      country: country,
    });

    return this.citiesRepository.save(city);
  }

  async updateCity(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findCityById(id);
    
    let country: Country | null = city.country;
    
    // If countryId is provided, check if the new parent country exists
    if (updateCityDto.countryId) {
      country = await this.countriesRepository.findOne({
        where: { id: updateCityDto.countryId },
      });

      if (!country) {
        throw new NotFoundException(`Country with ID ${updateCityDto.countryId} not found`);
      }
    }

    // Check if new name is already taken by another city in the same country
    if (updateCityDto.name && updateCityDto.name !== city.name) {
      const existingCity = await this.citiesRepository.findOne({
        where: { 
          name: updateCityDto.name,
          country: { id: country.id }
        },
        relations: ['country'],
      });

      if (existingCity && existingCity.id !== id) {
        throw new BadRequestException(`City with name '${updateCityDto.name}' already exists in this country`);
      }
    }

    // Update city
    if (updateCityDto.name) {
      city.name = updateCityDto.name;
    }
    
    city.country = country;

    return this.citiesRepository.save(city);
  }

  async removeCity(id: number): Promise<void> {
    const city = await this.findCityById(id);
    await this.citiesRepository.remove(city);
  }
}