import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  role: string;

  @ManyToOne(() => UserEntity, (user) => user.roles)
  user: UserEntity;
}
