import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { BulkUploadRateLimitInterceptor } from './interceptors/rate-limit-interceptor';

@Global() // 标记为全局模块，这样其他模块不需要手动 import 就能用里面的东西
@Module({
  providers: [
    // 使用 APP_FILTER 令牌，NestJS 会自动将这个类注册为全局过滤器
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: BulkUploadRateLimitInterceptor,
    },
    // 未来你还可以在这里添加全局拦截器 (APP_INTERCEPTOR)
    // 或全局守卫 (APP_GUARD)
  ],
})
export class CommonModule {}
