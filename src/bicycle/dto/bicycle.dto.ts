import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsUrl } from 'class-validator';
import { BicycleType } from '../../DB/Entities/bicycle.entity';

export class CreateBicycleDto {
  @IsString()
  name: string;

  @IsEnum(BicycleType)
  type: BicycleType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  frame_size?: string;

  @IsOptional()
  @IsInt()
  wheel_size?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateBicycleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(BicycleType)
  type?: BicycleType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  frame_size?: string;

  @IsOptional()
  @IsInt()
  wheel_size?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Оновлений DTO для створення заявки на поїздку
export class CreateRideApplicationDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  bicycle_id?: string; // ID велосипеда
}
