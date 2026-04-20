import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import contentParser from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FastifyConfigService implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // 获取底层的 Fastify 实例
    const httpAdapter = this.adapterHost.httpAdapter;
    const instance = httpAdapter.getInstance();

    // 注册插件
    await instance.register(contentParser, {
      limits: {
        fileSize:
          this.configService.get('UPLOAD_SIZE_LIMIT') || 10 * 1024 * 1024, // 10MB
        fields: 10, // 非文件字段数量限制
      },
      // 如果需要支持分片上传，建议开启 addToBody
      //addToBody: true,
    });
  }
}
