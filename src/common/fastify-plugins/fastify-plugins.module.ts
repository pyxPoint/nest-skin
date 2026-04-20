import { Module, OnModuleInit, Global } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { FastifyInstance } from 'fastify';
import contentParser from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';

@Global()
@Module({})
export class FastifyPluginsModule implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // 1. 获取 Fastify 实例
    const httpAdapter = this.adapterHost.httpAdapter;
    const instance: FastifyInstance = httpAdapter.getInstance();
    const fileSizeLimit = this.configService.get<number>('app.fileSizeLimit');
    await instance.register(contentParser, {
      // attachFieldsToBody: true, // 允许将非文件字段挂载到 body 上，DTO 才能验证
      /*  onFile: async (part) => {
        // 允许文件流继续传递
        (part as any).value = part.file;
      }, */
      limits: {
        fileSize: fileSizeLimit,
      },
    });
    await instance.register(fastifyStatic, {
      root: join(process.cwd(), 'uploads'),
      prefix: '/static/', // 这样前端访问 http://localhost:3000/static/avatar/123.jpg 就能看到图了
    });

    // 4. 你可以在这里继续注册其他 Fastify 原生插件
    // await instance.register(require('@fastify/helmet'));
    // await instance.register(require('@fastify/compress'));
  }
}
