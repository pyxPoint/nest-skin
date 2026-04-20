import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/logger.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 10485760, // 设置 Body 大小限制（10MB）
    }),
    { logger },
  );
  const configService = app.get(ConfigService);
  const env = configService.get<string>('app.env'),
    port = configService.get<number>('app.port'),
    prefix = configService.get<string>('app.apiPrefix');
  app.setGlobalPrefix(prefix!);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剥离 DTO 中未定义的属性
      forbidNonWhitelisted: false, // 如果传了 DTO 以外的属性，直接报错（更严格）
      transform: true, // 自动将普通的 JS 对象转换成 DTO 类的实例
      transformOptions: { enableImplicitConversion: true }, // 必须开启：隐式类型转换
    }),
  );
  await app.listen(port!);
  logger.log(
    `Server start success : ${env} | address: http://localhost:${port}`,
  );
  await app.init();
  return app.getHttpAdapter().getInstance();
}
export default async (req: any, res: any) => {
  const instance = await bootstrap();
  await instance.ready();
  instance.routing(req, res);
};
