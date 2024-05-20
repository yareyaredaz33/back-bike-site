import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Db } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  async handleJoinRoom(
    @MessageBody()
    data: { name: string; room: string; isUserToUser: boolean; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    let roomId = data.room;
    if (data.isUserToUser) {
      const roomChat = await this.chatService.checkRoomId(
        data.userId,
        data.room,
      );
      if (roomChat) {
        roomId = roomChat.room_id;
      } else {
        const id = new Date().toISOString();
        await this.chatService.saveId(data.userId, data.room, id);
      }
    }
    console.log(roomId);

    client.join(roomId);

    const messages = await this.chatService.getMessages(roomId);
    client.emit('initMessages', {
      messages,
      ...(data.isUserToUser && { roomId: roomId }),
    });

    this.server
      .to(roomId)
      .emit('room', { users: this.chatService.getRoomUsers(roomId) });
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: { message: string; params: any }) {
    const { message, params } = data;

    this.server
      .to(params.room)
      .emit('message', { user: params.name, message: message });

    this.chatService.saveMessage(params.name, data.message, params.room);
  }
}
