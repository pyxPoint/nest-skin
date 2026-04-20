import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger.config';

// 标记为全局模块，所有业务模块无需手动导入
@Global()
@Module({
  // 导入WinstonModule，使用自定义配置，并设为全局Logger
  imports: [WinstonModule.forRoot(winstonConfig)],
  // 导出WinstonModule，方便业务模块注入WinstonLogger
  exports: [WinstonModule],
})
export class LoggerModule {}
