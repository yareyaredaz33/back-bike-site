import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  room_id: string;

  @Column({ type: 'varchar' })
  user_id1: string;

  @Column({ type: 'varchar' })
  user_id2: string;
}
