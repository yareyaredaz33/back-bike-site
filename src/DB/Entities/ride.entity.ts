import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { RoadEntity } from './road.entity';
@Entity()
export class RideEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  user_count: number;

  @Column({ type: 'varchar' })
  road_id: string;

  @Column({ type: 'varchar' })
  title: string;
  @Column({ type: 'varchar', nullable: true })
  user_id: string;
  @Column({ type: 'varchar' })
  description: string;
  @CreateDateColumn({ type: 'varchar', nullable: true })
  createdat: string;
  @Column({ type: 'varchar', nullable: true })
  date: string;

  @ManyToOne(() => RoadEntity, (road) => road.rides, {
    onDelete: 'CASCADE',
  })
  road: RoadEntity;
}
