// src/auth/guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  // 你可以根据需要重写 handleRequest 来定制报错信息
  handleRequest(err, user, info) {
    this.logger.log(`JwtAuthGuard: ${info}`);
    if (err || !user) {
      this.logger.error(`JwtAuthGuard: ${info.message}`);
      throw (
        err ||
        new UnauthorizedException(
          'Token is invalid or expired, please login again',
        )
      );
    }
    return user;
  }
}
