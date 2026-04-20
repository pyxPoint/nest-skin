// src/modules/file/file.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  appendFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'fs';
import path, { join } from 'path';
import { ALLOWED_EXTENSIONS } from 'src/common/constants';
import { pipeline } from 'stream/promises';
import { PassThrough } from 'stream';
import { EventsService } from '../events/events.service';
import { ImportService } from '../navi/navi.import.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  constructor(
    private readonly eventsService: EventsService,
    private readonly importService: ImportService,
  ) {}
  async handleUploadImage(file: any, type: string) {
    if (!file) throw new BadRequestException('Image is required');
    this.logger.log('Start to save single image');
    const uploadDir = join(process.cwd(), 'uploads/images', type);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    if (!ALLOWED_EXTENSIONS.image.includes(path.extname(file.filename))) {
      throw new BadRequestException('Invalid image format');
    }
    // 2. 生成文件名
    const filePath = join(uploadDir, file.filename);

    // 3. 执行流式写入 (不占用内存，适合大文件)
    try {
      await pipeline(file.file, createWriteStream(filePath));
      return {
        url: `/static/${type}/${file.filename}`,
        filename: file.filename,
        mimetype: file.mimetype,
      };
    } catch (err) {
      throw new BadRequestException('Save file failed' + err.message);
    }
  }
  async CreateMenuByFile(
    fileHash: string,
    totalChunks: number,
    fileName: string,
  ) {
    return await this.mergeAndProcess(
      fileHash,
      totalChunks,
      fileName,
      this.importService.importNavigationExcel,
    );
  }
  async mergeAndProcess(
    fileHash: string,
    totalChunks: number,
    fileName: string,
    importToDatabase: (filePath: string) => Promise<void>,
  ) {
    const tempDir = `./uploads/temp/${fileHash}`;
    const targetPath = `./uploads/files/${Date.now()}-${fileName}`;

    try {
      // 1. 合并分片 (文件 IO 阶段)
      this.eventsService.emit(
        { stage: 'MERGING', percent: 0 },
        'upload-progress',
      );

      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = `${tempDir}/${i}`;
        const chunkBuffer = readFileSync(chunkPath);
        appendFileSync(targetPath, chunkBuffer); // 拼接到目标文件

        // 每合并 10% 进度推一次
        if (i % Math.ceil(totalChunks / 10) === 0) {
          this.eventsService.emit(
            {
              stage: 'MERGING',
              percent: Math.round((i / totalChunks) * 100),
            },
            'upload-progress',
          );
        }
      }

      // 2. 清理临时分片
      rmSync(tempDir, { recursive: true, force: true });

      // 3. 业务逻辑：如果是 Excel，开始解析入库 (数据库阶段)
      this.eventsService.emit(
        { stage: 'DB_INSERTING', percent: 0 },
        'upload-progress',
      );
      importToDatabase(targetPath).catch((err) => {
        this.eventsService.emit(
          { stage: 'ERROR', message: 'async import failed' + err.message },
          'import-progress',
        );
      });
      // 4. 成功完成
      return { message: 'merge success, import start', path: targetPath };
    } catch (error) {
      throw new BadRequestException('Merge file failed' + error.message);
    }
  }
}
