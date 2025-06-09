import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateBicycleDto, UpdateBicycleDto } from './dto/bicycle.dto';
import { JwtAuthGuard } from '../Auth/Guards/jwt.auth.guards';
import { BicycleService } from './bicycle.service';

@Controller('bicycles')
@UseGuards(JwtAuthGuard)
export class BicycleController {
  constructor(private readonly bicycleService: BicycleService) {}

  @Post()
  create(@Body() createBicycleDto: CreateBicycleDto, @Req() request) {
    return this.bicycleService.create(createBicycleDto, request.user.userInfo.id);
  }

  @Get('my')
  findUserBicycles(@Req() request) {
    return this.bicycleService.findByUserId(request.user.userInfo.id);
  }

  @Get('active')
  findUserActiveBicycle(@Req() request) {
    return this.bicycleService.findActiveBicycle(request.user.userInfo.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request) {
    return this.bicycleService.findOne(id, request.user.userInfo.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBicycleDto: UpdateBicycleDto,
    @Req() request,
  ) {
    return this.bicycleService.update(id, updateBicycleDto, request.user.userInfo.id);
  }

  @Patch(':id/activate')
  setActive(@Param('id') id: string, @Req() request) {
    return this.bicycleService.setActiveBicycle(id, request.user.userInfo.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request) {
    return this.bicycleService.remove(id, request.user.userInfo.id);
  }
}
