import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { LoggerModule } from './common/logger/logger.module';
import { ConfigModule as MyConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { FastifyPluginsModule } from './common/fastify-plugins/fastify-plugins.module';
import { FileModule } from './modules/file/file.module';
import { SocketModule } from './modules/socket/socket.module';
import { NaviModule } from './modules/navi/navi.module';
import { PageModule } from './modules/page/page.module';
import { RedisModule } from './modules/redis/redis.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [
    MyConfigModule,
    DatabaseModule, // Prisma/TypeORM 基础
    LoggerModule, // 全局日志服务
    FastifyPluginsModule, // Web 框架相关插件

    // 3. 通用共享层
    CommonModule, // 全局过滤器、拦截器、工具类

    // 4. 核心功能与认证层
    AuthModule, // 鉴权逻辑（通常被业务模块依赖）
    SocketModule, // WebSocket 基础（可能依赖 Auth）
    EventsModule, // 全局事件总线（可能依赖 Auth）事件流

    // 5. 业务逻辑层 (具体的业务领域)
    UserModule,
    FileModule,
    NaviModule,
    PageModule,

    // 6. 基础设施层
    RedisModule, // Redis 缓存服务（全局可用）
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
