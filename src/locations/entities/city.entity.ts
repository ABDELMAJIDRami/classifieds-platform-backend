import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Country } from './country.entity';
import { Ad } from '../../ads/entities/ad.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Country, (country) => country.cities)
  country: Country;

  @OneToMany(() => Ad, (ad) => ad.city)
  ads: Ad[];
}
