import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../DB/Entities/user.entity';
import { NotificationsEntity } from '../DB/Entities/notifications.entity';
import { SubscriptionsEntity } from '../DB/Entities/subscriptionsEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      NotificationsEntity,
      SubscriptionsEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
