import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Subcategory } from '../../categories/entities/subcategory.entity';
import { City } from '../../locations/entities/city.entity';
import { AdVersion} from './ad-version.entity';


@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.ads)
  user: User;

  @ManyToOne(() => Category, (category) => category.ads)
  category: Category;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.ads, { nullable: true })
  subcategory: Subcategory;

  @ManyToOne(() => City, (city) => city.ads)
  city: City;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => AdVersion, (adVersion) => adVersion.ad)
  versions: AdVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}