import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BicycleController } from './bicycle.controller';
import { BicycleService } from './bicycle.service';
import { BicycleEntity } from '../DB/Entities/bicycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BicycleEntity])],
  controllers: [BicycleController],
  providers: [BicycleService],
  exports: [BicycleService],
})
export class BicycleModule {}
