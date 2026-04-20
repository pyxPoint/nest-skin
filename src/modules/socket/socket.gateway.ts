import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { ChatDto } from './dto/chat.dto';
import { WsJwtGuard } from 'src/auth';
import { PING } from 'src/common/constants';

// 设置 namespace 或 cors 跨域
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'events',
  pingTimeout: PING.timeout,
  pingInterval: PING.interval,
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly socketService: SocketService) {}
  afterInit(server: Server) {
    this.socketService.server = server;
  }
  // 连接钩子
  async handleConnection(client: Socket) {
    this.socketService.handleConnection(client);
  }

  // 断开钩子
  handleDisconnect(client: Socket) {
    this.socketService.handleDisconnect(client);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: ChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.socketService.processMessage(data, client.id);
    this.server.emit('onMessage', result);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sensitiveData')
  async handleSensitiveData(@MessageBody() data: any) {
    return { status: 'ok' };
  }
}
