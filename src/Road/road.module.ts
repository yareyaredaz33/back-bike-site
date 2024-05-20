import { Module } from '@nestjs/common';
import { RoadService } from './road.service';
import { RoadController } from './road.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadEntity } from '../DB/Entities/road.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoadEntity])],
  controllers: [RoadController],
  providers: [RoadService],
})
export class RoadModule {}
