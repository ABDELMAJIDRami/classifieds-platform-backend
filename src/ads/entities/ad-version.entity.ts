import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Ad } from './ad.entity';
import { User } from '../../users/entities/user.entity';


export enum AdStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}


@Entity('ad_versions')
export class AdVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  versionNumber: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: AdStatus,
    default: AdStatus.PENDING
  })
  status: AdStatus;

  @ManyToOne(() => Ad, (ad) => ad.versions)
  ad: Ad;

  @ManyToOne(() => User, { nullable: true })
  moderator: User;

  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;
}
