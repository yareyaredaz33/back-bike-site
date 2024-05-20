import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Location } from '../../Road/dto/create-road.dto';
import { RideEntity } from './ride.entity';
import { Ride } from '../../ride/entities/ride.entity';

@Entity()
export class RoadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'jsonb' })
  finish_mark: Location;

  @Column({ type: 'jsonb' })
  start_mark: Location;

  @Column({ type: 'jsonb' })
  waypoints: Location[];

  @Column({ type: 'varchar' })
  user_id: string;

  @ManyToOne(() => UserEntity, (user) => user.roads)
  user: UserEntity;

  @OneToMany(() => RideEntity, (ride) => ride.road)
  rides: RideEntity[];
}
