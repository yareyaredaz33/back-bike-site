import { Injectable } from '@nestjs/common';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { RideEntity } from '../DB/Entities/ride.entity';
import { UserEntityRide } from '../DB/Entities/user.entity.ride';
import { NotificationsEntity } from '../DB/Entities/notifications.entity';
import {
  ApplicationStatus,
  RideApplicationEntity,
} from '../DB/Entities/ride-application.entity';

@Injectable()
export class RideService {
  constructor(
    @InjectRepository(RideEntity)
    private rideEntityRepository: Repository<RideEntity>,
    @InjectRepository(UserEntityRide)
    private userRideEntity: Repository<UserEntityRide>,
    @InjectRepository(NotificationsEntity)
    private notificationRepository: Repository<NotificationsEntity>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(UserLevelEntity)
    private userLevelRepository: Repository<UserLevelEntity>,
    private achievementCronService: AchievementCronService,
    private levelService: LevelService,
    private bicycleService: BicycleService,
  ) {}
  create(createRideDto: CreateRideDto, userId: string) {
    // @ts-ignore
    const ride = this.rideEntityRepository.create({
      user_count: createRideDto.usersCount,
      description: createRideDto.description,
      title: createRideDto.title,
      road_id: createRideDto.roadId,
      date: createRideDto.date,
      user_id: userId,
      road: createRideDto.roadId,
      isPaid: createRideDto.isPaid,
      distance: createRideDto.distance,
      duration: createRideDto.duration,
    });
    const rideEntity = this.rideEntityRepository.save(ride);
    return rideEntity;
  }

  async findAll(userId?: string, search?: string) {
    // Якщо вказано userId, повертаємо поїздки цього користувача
    if (userId) {
      const ids = await this.userRideEntity.find({
        where: { user_id: userId },
      });
      const newIds = ids.map((id) => id.ride_id);

      if (newIds.length === 0) {
        return [];
      }

      return this.rideEntityRepository.find({ where: { id: In(newIds) } });
    }
    return this.rideEntityRepository.find();
  }

  async findOne(id: string, userId: string) {
    const result = await this.rideEntityRepository.findOne({ where: { id } });
    const [, rideCount] = await this.userRideEntity
      .createQueryBuilder('ride')
      .where({ ride_id: id })
      .getManyAndCount();
    const wasPaid = await this.paymentRepository.find({
      where: { ride_id: id, user_id: userId },
    });
    console.log(wasPaid);
    const isApplied = await this.userRideEntity.findOne({
      where: { user_id: userId, ride_id: id },
    });
    if (wasPaid.find((e) => e.status === 'succeeded')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      result.wasPaid = true;
    }
    if (isApplied) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      result.isApplied = true;
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      result.isApplied = false;
    }
    // @ts-ignore
    result.current_user_count = rideCount + 1;
    return result;
  }

  update(id: number, updateRideDto: UpdateRideDto) {
    return `This action updates a #${id} ride`;
  }

  remove(id: string) {
    return this.rideEntityRepository.delete({ id });
  }

  async applyToRide({ id: user_id, username }: any, id: string) {
    const subscriptions = await this.userRideEntity.save({
      ride_id: id,
      user_id: user_id,
    });
    this.notificationRepository.save({
      title: 'Ура',
      description: `Ваш друг ${username} приєднався до нової поїздки`,
      user_id: user_id,
      ride_id: id,
    });
    return subscriptions;
  }

  async unApplyToRide({ id: user_id, username }: any, id: string) {
    const subscriptions = await this.userRideEntity.delete({
      ride_id: id,
      user_id: user_id,
    });
    this.notificationRepository.save({
      title: 'Тільки не це',
      description: `Ваш друг ${username} відмовився від поїздки`,
      user_id: user_id,
      ride_id: id,
    });
    return subscriptions;
  }

  findAllForUser(userId: string) {
    return this.rideEntityRepository
      .createQueryBuilder('ride')
      .where({ user_id: userId })
      .orderBy('ride.createdat', 'DESC')
      .getMany();
  }
}
