import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // 1. 确定 HTTP 状态码 (如果是 HttpException 则获取其状态码，否则默认为 500)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. 格式化错误消息
    let message: any;
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      // NestJS 的标准响应通常是 { message: '...' } 或直接是字符串
      message =
        typeof res === 'object' ? (res as any)?.message || 'error' : res;
    } else {
      // 非 HttpException (如原生 Error)，只取 message 属性，严禁 stringify 整个对象
      message = exception?.message || 'Internal server error';
    }

    // 3. 记录日志（修复你之前看不到 Logger 输出的问题）
    status >= 500
      ? this.logger.error(
          `[${request.method}] ${request.url} - Server Error: ${message}`,
          exception.stack,
          'AllExceptionsFilter',
        )
      : this.logger.warn(
          `[${request.method}] ${request.url} - Client Error : ${message}`,
        );

    const backData = {
      code: status,
      message: Array.isArray(message) ? message[0] : message, // 兼容 ValidationPipe 的报错数组
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error:
        exception.name ||
        (status >= 500 ? 'Internal Server Error' : 'Bad Request'),
    };
    // 4. 发送 JSON 响应给前端
    response
      .code(status)
      .send(
        exception instanceof HttpException
          ? { ...backData, ...(exception.getResponse() as any) }
          : backData,
      );
  }
}
