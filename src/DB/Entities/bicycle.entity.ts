import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum BicycleType {
  ROAD = 'road',
  MOUNTAIN = 'mountain',
  HYBRID = 'hybrid',
  BMX = 'bmx',
  ELECTRIC = 'electric',
  FOLDING = 'folding',
  CITY = 'city',
  GRAVEL = 'gravel',
}

@Entity()
export class BicycleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar' })
  name: string; // Назва велосипеда (наприклад "Мій Trek")

  @Column({
    type: 'enum',
    enum: BicycleType,
  })
  type: BicycleType;

  @Column({ type: 'varchar', nullable: true })
  brand: string; // Бренд (Trek, Giant, Specialized тощо)

  @Column({ type: 'varchar', nullable: true })
  model: string; // Модель

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @Column({ type: 'int', nullable: true })
  year: number; // Рік випуску

  @Column({ type: 'varchar', nullable: true })
  frame_size: string; // Розмір рами (S, M, L, XL або в см)

  @Column({ type: 'int', nullable: true })
  wheel_size: number; // Розмір коліс в дюймах (26, 27.5, 29 тощо)

  @Column({ type: 'text', nullable: true })
  description: string; // Додатковий опис

  @Column({ type: 'varchar', nullable: true })
  image_url: string; // URL зображення велосипеда

  @Column({ default: true })
  is_active: boolean; // Чи активний велосипед (користувач може мати кілька)

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Відношення
  @ManyToOne(() => UserEntity, (user) => user.bicycles)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
