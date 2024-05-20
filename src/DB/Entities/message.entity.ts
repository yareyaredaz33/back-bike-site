import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  message: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  ride_id: string;
}
