// src/modules/file/file.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  Logger,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { UploadFileDto, UploadImgDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from 'src/auth';
import type { FastifyRequest } from 'fastify';

@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-img')
  async uploadImg(@Req() req: FastifyRequest) {
    this.logger.log(`uploadImg---`);
    const fileData = await req.file();
    if (!fileData) {
      throw new Error('No file uploaded');
    }
    this.logger.log(
      `收到文件: ${fileData.filename}, 字段名: ${fileData.fieldname}, 类型: ${fileData.mimetype}`,
    );
    const type = (fileData.fields.type as any)?.value;
    return this.fileService.handleUploadImage(fileData, type);
  }
  @Post('add-navi-file')
  async addNaviFile(@Body() body: any) {
    return this.fileService.CreateMenuByFile(
      body.fileHash,
      body.totalChunks,
      body.fileName,
    );
  }
}
