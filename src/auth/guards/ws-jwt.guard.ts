import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const token = client.handshake.query.token;
      const payload = await this.jwtService.verifyAsync(token);

      // 将用户信息注入请求上下文
      context.switchToHttp().getRequest().user = payload;
      return true;
    } catch (err) {
      // WebSocket 守卫失败需要抛出 WsException
      throw new WsException('validate error');
    }
  }
}
