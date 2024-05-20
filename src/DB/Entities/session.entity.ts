import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  refresh_token: string;

  @Column({ type: 'varchar' })
  ip: string;

  @UpdateDateColumn({ type: 'varchar' })
  last_active_date: string;

  @Column({ type: 'varchar' })
  device_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  user: UserEntity;
}
