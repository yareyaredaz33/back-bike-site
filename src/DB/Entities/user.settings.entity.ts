import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class UserSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  isArticlesPageWasOpened: boolean;

  @Column({ type: 'varchar' })
  theme: string;

  @ManyToOne(() => UserEntity, (user) => user.settings)
  user: UserEntity;
}
