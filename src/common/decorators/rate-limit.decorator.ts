import { SetMetadata } from '@nestjs/common';

export const RateLimitConfig = (points: number, duration: number) =>
  SetMetadata('rateLimitConfig', { points, duration });
export const RateLimit = (points: number, duration: number) =>
  RateLimitConfig(points, duration);
