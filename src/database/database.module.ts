import { Module, Global } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

// Global() 标记为全局模块，所有业务模块无需手动导入
@Global()
@Module({
  // 导入PrismaModule并配置为全局，自动管理PrismaClient单例
  imports: [
    PrismaModule.forRoot({
      isGlobal: true, // 推荐使用库自带的全局参数，而不是 @Global()
      prismaServiceOptions: {
        prismaOptions: {
          log: ['query', 'info', 'warn', 'error'],
          errorFormat: 'pretty',
        } as any,
        explicitConnect: true, // 可选：是否在应用启动时显式连接数据库
      },
    }),
  ],
  // 导出PrismaModule，让业务模块可注入PrismaService
  exports: [PrismaModule],
})
export class DatabaseModule {}
