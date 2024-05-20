import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../../DB/Entities/message.entity';
import { UserEntity } from '../../DB/Entities/user.entity';
import { ChatEntity } from '../../DB/Entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageEntityRepository: Repository<MessageEntity>,
    @InjectRepository(ChatEntity)
    private chatEntityRepository: Repository<ChatEntity>,
  ) {}
  private users = [];

  getRoomUsers(room) {
    return this.users.filter((user) => user.room === room);
  }

  async getMessages(room) {
    const messages = await this.messageEntityRepository.find({
      where: { ride_id: room },
    });
    return messages.map((e) => {
      return {
        user: e.name,
        message: e.message,
      };
    });
  }

  saveMessage(name, message, room) {
    const savedMessage = this.messageEntityRepository.create({
      name,
      message,
      ride_id: room,
    });
    return this.messageEntityRepository.save(savedMessage);
  }

  async checkRoomId(userId: string, room: string) {
    const result = this.chatEntityRepository.findOne({
      where: [
        { user_id1: userId, user_id2: room },
        { user_id1: room, user_id2: userId },
      ],
    });
    return result;
  }

  async saveId(userId: string, room: string, id: string) {
    const result = this.chatEntityRepository.create({
      user_id1: userId,
      user_id2: room,
      room_id: id,
    });
    await this.chatEntityRepository.save(result);
    return result;
  }
}
