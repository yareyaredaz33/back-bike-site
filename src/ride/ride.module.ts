import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideEntity } from '../DB/Entities/ride.entity';
import { UserEntityRide } from '../DB/Entities/user.entity.ride';
import { NotificationsEntity } from '../DB/Entities/notifications.entity';
import { Payment } from '../DB/Entities/Payment';

@Module({
  controllers: [RideController],
  providers: [RideService],
  imports: [
    TypeOrmModule.forFeature([RideEntity, UserEntityRide, NotificationsEntity]),
      Payment,
  ],
})
export class RideModule {}
