import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileExtratorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FileExtratorInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    this.logger.log(`FileExtratorInterceptor: ${request.body}`);
    const body = request.body;
    if (!!body?.file) {
      // 提取文件并放入 request.uploadedFiles，方便后面使用
      this.logger.log('FileExtratorInterceptor: extract file from body');
      request.uploadedFiles = Array.isArray(body.file)
        ? body.file
        : [body.file];
    }
    return next.handle();
  }
}
