import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideEntity } from '../DB/Entities/ride.entity';
import { UserEntityRide } from '../DB/Entities/user.entity.ride';
import { NotificationsEntity } from '../DB/Entities/notifications.entity';

@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [
    TypeOrmModule.forFeature([RideEntity, UserEntityRide, NotificationsEntity]),
  ],
})
export class RideModule {}
