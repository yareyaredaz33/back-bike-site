import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { RideEntity } from '../DB/Entities/ride.entity';
import { UserEntityRide } from '../DB/Entities/user.entity.ride';
import { NotificationsEntity } from '../DB/Entities/notifications.entity';
import { Payment } from '../DB/Entities/Payment';
import { UserLevelEntity } from '../DB/Entities/level.entity';
import { AchievementCronService } from '../achievment/achievement-cron.service';
import { LevelService } from '../level/level.service';
import { CreateRideApplicationDto } from './dto/create-ride-application.dto';
import { UserEntity } from '../DB/Entities/user.entity';
import {
  ApplicationStatus,
  RideApplicationEntity,
} from '../DB/Entities/ride-application.entity';
import { UpdateRideApplicationDto } from './dto/update-ride-application.dto';
import { BicycleEntity } from '../DB/Entities/bicycle.entity';
import { BicycleService } from '../bicycle/bicycle.service';

interface RecommendedRideWithScore extends RideEntity {
  confidenceScore: number;
}

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
      price: createRideDto.price || 0,
      distance: createRideDto.distance,
      duration: createRideDto.duration,
    });
    const rideEntity = await this.rideEntityRepository.save(ride);

    // Додаємо XP за створення поїздки
    const xpInfo = await this.levelService.addRideXP(
      userId,
      createRideDto.distance || 0,
      createRideDto.duration || 0,
    );

    // Перевіряємо досягнення
    await this.achievementCronService.checkUserAchievementsAfterRide(userId);

    return {
      ...rideEntity,
      xpEarned: xpInfo.xpEarned,
      xpBreakdown: xpInfo.xpBreakdown,
      levelInfo: xpInfo.updatedLevel,
    };
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

  async applyToRide(
    { id: user_id, username }: any,
    rideId: string,
    applicationDto?: CreateRideApplicationDto,
  ) {
    // Перевіряємо, чи поїздка існує
    const ride = await this.rideEntityRepository.findOne({
      where: { id: rideId },
    });

    if (!ride) {
      throw new BadRequestException('Поїздка не знайдена');
    }

    // Отримуємо інформацію про створювача поїздки
    const rideCreator = await this.userRepository.findOne({
      where: { id: ride.user_id },
    });

    // Перевіряємо, чи користувач вже подавав заявку
    const existingApplication = await this.rideApplicationRepository.findOne({
      where: { user_id, ride_id: rideId },
    });

    if (existingApplication) {
      throw new BadRequestException('Ви вже подали заявку на цю поїздку');
    }

    // Перевіряємо, чи користувач вже приєднаний
    const existingParticipation = await this.userRideEntity.findOne({
      where: { user_id, ride_id: rideId },
    });

    if (existingParticipation) {
      throw new BadRequestException('Ви вже приєднані до цієї поїздки');
    }

    // Якщо вказано bicycle_id, перевіряємо, що велосипед належить користувачу
    let bicycle = null;
    if (applicationDto?.bicycle_id) {
      bicycle = await this.bicycleService.getBicycleForUser(
        applicationDto.bicycle_id,
        user_id,
      );
    } else {
      // Якщо велосипед не вказано, спробуємо взяти активний
      bicycle = await this.bicycleService.findActiveBicycle(user_id);
    }

    // Якщо створювач поїздки є тренером, створюємо заявку
    if (rideCreator && rideCreator.role === 'trainer') {
      const application = await this.rideApplicationRepository.save({
        user_id,
        ride_id: rideId,
        bicycle_id: bicycle?.id || null,
        message: applicationDto?.message,
        status: ApplicationStatus.PENDING,
      });

      // Відправляємо нотифікацію тренеру
      await this.notificationRepository.save({
        title: 'Нова заявка на поїздку',
        description: `${username} подав заявку на участь у вашій поїздці "${ride.title}"${
          bicycle ? ` з велосипедом ${bicycle.name} (${bicycle.type})` : ''
        }`,
        user_id: ride.user_id,
        ride_id: rideId,
      });

      return {
        type: 'application',
        application: {
          ...application,
          bicycle,
        },
        message: 'Заявка подана. Очікуйте підтвердження від тренера.',
      };
    } else {
      // Якщо це не тренер, приєднуємося напряму (як було раніше)
      return this.directJoinRide(user_id, username, rideId, ride);
    }
  }

  // Допоміжний метод для прямого приєднання
  private async directJoinRide(
    user_id: string,
    username: string,
    rideId: string,
    ride: RideEntity,
  ) {
    const subscription = await this.userRideEntity.save({
      ride_id: rideId,
      user_id: user_id,
    });
    this.notificationRepository.save({
      title: 'Ура',
      description: `Ваш друг ${username} приєднався до нової поїздки`,
      user_id: user_id,
      ride_id: rideId,
    });

    // Додаємо XP за приєднання до поїздки
    if (ride) {
      const xpInfo = await this.levelService.addRideXP(
        user_id,
        ride.distance || 0,
        ride.duration || 0,
      );

      await this.achievementCronService.checkUserAchievementsAfterRide(user_id);
    }

    return {
      type: 'direct_join',
      subscription,
      message: 'Ви успішно приєдналися до поїздки!',
    };
  }

  // Підтвердження або відхилення заявки тренером
  async handleRideApplication(
    trainerId: string,
    applicationId: string,
    updateDto: UpdateRideApplicationDto,
  ) {
    const application = await this.rideApplicationRepository.findOne({
      where: { id: applicationId },
      relations: ['ride', 'user'],
    });

    if (!application) {
      throw new BadRequestException('Заявка не знайдена');
    }

    // Перевіряємо, чи користувач є тренером і створювачем поїздки
    if (application.ride.user_id !== trainerId) {
      throw new ForbiddenException('Ви не можете управляти цією заявкою');
    }

    // Оновлюємо статус заявки
    application.status = updateDto.status;
    application.trainer_notes = updateDto.trainer_notes;

    await this.rideApplicationRepository.save(application);

    // Якщо заявка схвалена, додаємо користувача до поїздки
    if (updateDto.status === ApplicationStatus.APPROVED) {
      await this.userRideEntity.save({
        ride_id: application.ride_id,
        user_id: application.user_id,
      });

      // Додаємо XP за приєднання до поїздки
      const xpInfo = await this.levelService.addRideXP(
        application.user_id,
        application.ride.distance || 0,
        application.ride.duration || 0,
      );

      await this.achievementCronService.checkUserAchievementsAfterRide(
        application.user_id,
      );
    }

    // Відправляємо нотифікацію користувачу
    const notificationTitle =
      updateDto.status === ApplicationStatus.APPROVED
        ? 'Заявка схвалена!'
        : 'Заявка відхилена';

    const notificationDescription =
      updateDto.status === ApplicationStatus.APPROVED
        ? `Ваша заявка на поїздку "${application.ride.title}" була схвалена тренером`
        : `Ваша заявка на поїздку "${application.ride.title}" була відхилена тренером`;

    await this.notificationRepository.save({
      title: notificationTitle,
      description: notificationDescription,
      user_id: application.user_id,
      ride_id: application.ride_id,
    });

    return application;
  }

  // Отримання заявок для тренера
  // Простий метод без joins - тільки пошук по userId
  async getApplicationsForTrainer(trainerId: string, rideId?: string) {
    // 1. Спочатку отримуємо всі поїздки тренера
    const trainerRides = await this.rideEntityRepository.find({
      where: { user_id: trainerId },
    });

    if (trainerRides.length === 0) {
      return [];
    }

    const trainerRideIds = trainerRides.map((ride) => ride.id);

    // 2. Отримуємо заявки для поїздок тренера
    let whereCondition: any = { ride_id: In(trainerRideIds) };

    if (rideId) {
      whereCondition = { ride_id: rideId };
    }

    const applications = await this.rideApplicationRepository.find({
      where: whereCondition,
      order: { created_at: 'DESC' },
    });

    if (applications.length === 0) {
      return [];
    }

    // 3. Додаємо дані для кожної заявки, включаючи велосипед
    const applicationsWithData = await Promise.all(
      applications.map(async (application) => {
        // Отримуємо інформацію про користувача
        const user = await this.userRepository.findOne({
          where: { id: application.user_id },
        });

        // Отримуємо інформацію про поїздку
        const ride = await this.rideEntityRepository.findOne({
          where: { id: application.ride_id },
        });

        // Отримуємо інформацію про велосипед
        let bicycle = null;
        if (application.bicycle_id) {
          bicycle = await this.bicycleRepository.findOne({
            where: { id: application.bicycle_id },
          });
        }

        // Отримуємо рівень користувача
        const userLevel = await this.userLevelRepository.findOne({
          where: { user_id: application.user_id },
        });

        // Отримуємо статистику користувача
        const userStats = await this.getUserSimpleStats(application.user_id);

        return {
          ...application,
          user: user
            ? {
                id: user.id,
                username: user.username,
                first: user.first,
                lastname: user.lastname,
                avatar: user.avatar,
                role: user.role,
              }
            : null,
          ride: ride
            ? {
                id: ride.id,
                title: ride.title,
                date: ride.date,
                distance: ride.distance,
                duration: ride.duration,
              }
            : null,
          bicycle: bicycle
            ? {
                id: bicycle.id,
                name: bicycle.name,
                type: bicycle.type,
                brand: bicycle.brand,
                model: bicycle.model,
                color: bicycle.color,
              }
            : null,
          userStats: {
            ...userStats,
            level: userLevel?.level || 1,
          },
        };
      }),
    );

    return applicationsWithData.filter((app) => app.user && app.ride);
  }
  // Допоміжний метод для отримання простої статистики користувача
  private async getUserSimpleStats(userId: string) {
    // Отримуємо поїздки, до яких приєднувався користувач
    const userRideRecords = await this.userRideEntity.find({
      where: { user_id: userId },
    });

    // Отримуємо поїздки, які створив користувач
    const createdRides = await this.rideEntityRepository.find({
      where: { user_id: userId },
    });

    // Статистика приєднаних поїздок
    let joinedDistance = 0;
    let joinedDuration = 0;

    if (userRideRecords.length > 0) {
      const joinedRideIds = userRideRecords.map((ur) => ur.ride_id);
      const joinedRides = await this.rideEntityRepository.find({
        where: { id: In(joinedRideIds) },
      });

      joinedDistance = joinedRides.reduce(
        (sum, ride) => sum + (ride.distance || 0),
        0,
      );
      joinedDuration = joinedRides.reduce(
        (sum, ride) => sum + (ride.duration || 0),
        0,
      );
    }

    // Статистика створених поїздок
    const createdDistance = createdRides.reduce(
      (sum, ride) => sum + (ride.distance || 0),
      0,
    );
    const createdDuration = createdRides.reduce(
      (sum, ride) => sum + (ride.duration || 0),
      0,
    );

    // Загальна статистика
    const totalRides = userRideRecords.length + createdRides.length;
    const totalDistance = joinedDistance + createdDistance;
    const totalDuration = joinedDuration + createdDuration;

    return {
      // Приєднані поїздки
      joinedRides: userRideRecords.length,
      joinedDistance: joinedDistance,
      joinedDuration: joinedDuration,

      // Створені поїздки
      createdRides: createdRides.length,
      createdDistance: createdDistance,
      createdDuration: createdDuration,

      // Загальна статистика
      totalRides: totalRides,
      totalDistance: totalDistance,
      totalDuration: totalDuration,

      // Середні показники
      avgDistance: totalRides > 0 ? Math.round(totalDistance / totalRides) : 0,
      avgDuration: totalRides > 0 ? Math.round(totalDuration / totalRides) : 0,
    };
  }

  async unApplyToRide({ id: user_id, username }: any, id: string) {
    const subscriptions = await this.userRideEntity.delete({
      ride_id: id,
      user_id: user_id,
    });

    await this.notificationRepository.save({
      title: 'Тільки не це',
      description: `Ваш друг ${username} відмовився від поїздки`,
      user_id: user_id,
      ride_id: id,
    });

    return subscriptions;
  }

  async findAllForUser(userId: string) {
    const ride_ids = await this.userRideEntity.find({
      where: { user_id: userId },
    });

    const ids = ride_ids.map((ride) => ride.ride_id);
    const rides = await this.rideEntityRepository.find({
      where: { id: In(ids) },
      order: {
        date: 'ASC',
      },
    });
    const userRides = await this.rideEntityRepository.find({
      where: { user_id: userId },
      order: {
        date: 'ASC',
      },
    });
    return [...rides, ...userRides];
  }
}
