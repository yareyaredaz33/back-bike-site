import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NotificationsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  user_id: string;
}
