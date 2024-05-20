import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../DB/Entities/user.entity';
import { UserRoleEntity } from '../DB/Entities/user.role.entity';
import { UserSettingsEntity } from '../DB/Entities/user.settings.entity';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SessionEntity } from '../DB/Entities/session.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../User/user.service';
import { JwtStrategy } from './Strategy/jwt.strategy';
import { UserModel } from '../User/Model/user.model';
import { SubscriptionsEntity } from '../DB/Entities/subscriptionsEntity';
import { NotificationsEntity } from '../DB/Entities/notifications.entity';
import { ChatEntity } from '../DB/Entities/chat.entity';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 100,
        },
      ],
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      UserRoleEntity,
      UserSettingsEntity,
      SessionEntity,
      SubscriptionsEntity,
      NotificationsEntity,
      ChatEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET'),
        signOptions: { expiresIn: '100m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    ConfigService,
    UserService,
    JwtStrategy,
    UserModel,
  ],
  exports: [AuthService, UserService],
})
export class AuthModule {}
