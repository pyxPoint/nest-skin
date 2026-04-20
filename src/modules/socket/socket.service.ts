import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  public server: Server;
  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
    // 可以在这里处理鉴权逻辑
  }
  handleDisconnect(client) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server?.to(client.id)?.disconnectSockets();
  }
  emitProgress(clientId: string, progress: number) {
    this.server?.to(clientId)?.emit('uploadProgress', { progress });
  }
  async processMessage(data: any, clientId: string) {
    // 处理持久化或逻辑计算
    return { ...data, sender: clientId, time: new Date() };
  }
}
