import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class BulkUploadRateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 假设你有 AuthGuard 处理用户信息
    const userId = user?.id || request.ip;

    // 从装饰器获取限制配置（例如：每分钟允许上传的总条数）
    const limitConfig = this.reflector.get<{
      points: number;
      duration: number;
    }>('rateLimitConfig', context.getHandler()) || {
      points: 20000,
      duration: 60,
    }; // 默认 60 秒内允许累计上传 2 万条

    const body = request.body;
    const itemCount = Array.isArray(body) ? body.length : 1;

    const key = `rate_limit:bulk_upload:${userId}`;

    // 1. 获取当前已消耗的额度
    // 2. 原子增加消耗的点数
    const currentTotal = await this.redisService.incrBy(key, itemCount);

    // 3. 如果是这个周期的第一笔，设置倒计时（例如 60秒 后重置额度）
    if (currentTotal === itemCount) {
      await this.redisService.expire(key, limitConfig.duration);
    }

    // 4. 判断是否超标
    if (currentTotal > limitConfig.points) {
      const retryAfter = await this.redisService.ttl(key);
      throw new HttpException(
        {
          message:
            'Periodic upload rate limit exceeded, please try again later.',
          currentRequestCount: itemCount,
          maxLimit: limitConfig.points,
          retryAfter: retryAfter > 0 ? retryAfter : limitConfig.duration,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }
}
