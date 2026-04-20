import { Module, OnModuleInit } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ImportService } from '../navi/navi.import.service';

@Module({
  controllers: [FileController],
  providers: [FileService, ImportService],
  // 如果其他模块（如 UserModule）需要调用文件保存功能，记得导出 Service
  exports: [FileService],
})
export class FileModule {}
