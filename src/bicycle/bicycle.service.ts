import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BicycleEntity } from '../DB/Entities/bicycle.entity';
import { CreateBicycleDto, UpdateBicycleDto } from './dto/bicycle.dto';

@Injectable()
export class BicycleService {
  constructor(
    @InjectRepository(BicycleEntity)
    private bicycleRepository: Repository<BicycleEntity>,
  ) {}

  async create(createBicycleDto: CreateBicycleDto, userId: string) {
    // Якщо це перший велосипед користувача або встановлено is_active = true,
    // деактивуємо інші велосипеди
    if (createBicycleDto.is_active !== false) {
      await this.deactivateAllUserBicycles(userId);
    }

    const bicycle = this.bicycleRepository.create({
      ...createBicycleDto,
      user_id: userId,
      is_active: createBicycleDto.is_active !== false, // За замовчуванням true
    });

    return this.bicycleRepository.save(bicycle);
  }

  async findByUserId(userId: string) {
    return this.bicycleRepository.find({
      where: { user_id: userId },
      order: { is_active: 'DESC', created_at: 'DESC' },
    });
  }

  async findActiveBicycle(userId: string) {
    return this.bicycleRepository.findOne({
      where: { user_id: userId, is_active: true },
    });
  }

  async findOne(id: string, userId: string) {
    const bicycle = await this.bicycleRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!bicycle) {
      throw new NotFoundException('Велосипед не знайдено');
    }

    return bicycle;
  }

  async update(id: string, updateBicycleDto: UpdateBicycleDto, userId: string) {
    const bicycle = await this.findOne(id, userId);

    // Якщо встановлюється активним, деактивуємо інші
    if (updateBicycleDto.is_active === true) {
      await this.deactivateAllUserBicycles(userId);
    }

    Object.assign(bicycle, updateBicycleDto);
    return this.bicycleRepository.save(bicycle);
  }

  async setActiveBicycle(id: string, userId: string) {
    const bicycle = await this.findOne(id, userId);

    // Деактивуємо всі інші велосипеди користувача
    await this.deactivateAllUserBicycles(userId);

    // Активуємо вибраний велосипед
    bicycle.is_active = true;
    return this.bicycleRepository.save(bicycle);
  }

  async remove(id: string, userId: string) {
    const bicycle = await this.findOne(id, userId);

    // Якщо видаляємо активний велосипед, активуємо перший доступний
    if (bicycle.is_active) {
      const otherBicycles = await this.bicycleRepository.find({
        where: { user_id: userId },
        order: { created_at: 'ASC' },
      });

      const nextBicycle = otherBicycles.find(b => b.id !== id);
      if (nextBicycle) {
        nextBicycle.is_active = true;
        await this.bicycleRepository.save(nextBicycle);
      }
    }

    return this.bicycleRepository.remove(bicycle);
  }

  private async deactivateAllUserBicycles(userId: string) {
    await this.bicycleRepository.update(
      { user_id: userId },
      { is_active: false },
    );
  }

  // Допоміжний метод для отримання велосипеда з валідацією власності
  async getBicycleForUser(bicycleId: string, userId: string) {
    const bicycle = await this.bicycleRepository.findOne({
      where: { id: bicycleId, user_id: userId },
    });

    if (!bicycle) {
      throw new BadRequestException(
        'Велосипед не знайдено або не належить користувачу',
      );
    }

    return bicycle;
  }
}
