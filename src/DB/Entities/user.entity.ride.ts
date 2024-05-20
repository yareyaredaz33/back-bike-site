import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntityRide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  ride_id: string;

  @Column({ type: 'varchar' })
  user_id: string;
}
