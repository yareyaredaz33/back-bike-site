import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RideEntity } from '../DB/Entities/ride.entity';
import { Repository } from 'typeorm';
import { NotificationsEntity } from '../DB/Entities/notifications.entity';
import { SubscriptionsEntity } from '../DB/Entities/subscriptionsEntity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationsEntity)
    private notificationsRepository: Repository<NotificationsEntity>,
    @InjectRepository(SubscriptionsEntity)
    private subscriptionEntity: Repository<SubscriptionsEntity>,
  ) {}
  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  async findAll(userId) {
    return await this.notificationsRepository
      .createQueryBuilder('notification')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('subscription.celebrity_id')
          .from(SubscriptionsEntity, 'subscription')
          .where('subscription.user_id = :userId', { userId })
          .getQuery();
        return 'notification.user_id IN ' + subQuery;
      })
      .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
