import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { configs } from '../config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // 关键：在这里设置全局可用
      expandVariables: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      load: configs,
      // 将复杂的校验逻辑从 AppModule 抽离到这里
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('3600s'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional(),
        REDIS_DB: Joi.number().default(0),
        UPLOAD_SIZE_LIMIT: Joi.number().default(10485760),
      }),
      validationOptions: {
        allowUnknown: true, // 允许额外的环境变量（如系统自带的）
        abortEarly: true, // 发现第一个错误就停止启动
      },
    }),
  ],
})
export class ConfigModule {}
