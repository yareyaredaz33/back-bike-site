import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../DB/Entities/message.entity';
import { UserEntity } from '../DB/Entities/user.entity';
import { ChatEntity } from '../DB/Entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, UserEntity, ChatEntity])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
