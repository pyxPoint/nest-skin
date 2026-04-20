import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { EventsService } from '../events/events.service'; // 之前创建的通知中心
import * as ExcelJS from 'exceljs';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async importNavigationExcel(filePath: string) {
    const workbook = new ExcelJS.Workbook();
    const batchSize = 1000; // 每 1000 条写一次数据库
    let rows: any[] = [];
    let processedCount = 0;

    try {
      // 1. 加载文件
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // 读取第一个工作表
      const totalRows = worksheet?.actualRowCount
        ? worksheet.actualRowCount - 1
        : 0; // 减去表头

      this.eventsService.emit(
        { stage: 'PARSING', total: totalRows },
        'import-progress',
      );

      // 2. 遍历行
      worksheet?.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        // 跳过第一行表头
        if (rowNumber === 1) return;

        // 映射 Excel 列到 Prisma 模型字段
        const rowData = {
          title: row.getCell(1).value?.toString(),
          url: row.getCell(2).value?.toString(),
          batchTag: row.getCell(3).value?.toString() || 'default',
          // 其他字段...
        };

        rows.push(rowData);
        processedCount++;

        // 3. 达到分片大小，执行批量写入
        if (rows.length >= batchSize) {
          const currentBatch = [...rows];
          rows = []; // 清空缓冲区，防止阻塞
          await this.saveBatch(currentBatch, processedCount, totalRows);
        }
      });

      // 4. 处理最后剩下的尾数数据
      if (rows.length > 0) {
        await this.saveBatch(rows, processedCount, totalRows);
      }

      this.eventsService.emit(
        { stage: 'DONE', total: processedCount },
        'import-progress',
      );
      this.logger.log(`成功导入 ${processedCount} 条导航数据`);
    } catch (error) {
      this.logger.error('Excel 导入失败', error.stack);
      this.eventsService.emit(
        { stage: 'ERROR', message: error.message },
        'import-progress',
      );
    }
  }

  // 抽离出来的私有批量写入方法
  private async saveBatch(data: any[], current: number, total: number) {
    // 使用 createMany 提高性能
    await this.prisma.navigation.createMany({
      data,
      skipDuplicates: true, // 遇到重复 URL（唯一约束）时跳过，防止整批失败
    });

    // 推送进度到 SSE
    const percent = Math.round((current / total) * 100);
    this.eventsService.emit(
      { stage: 'INSERTING', current, total, percent },
      'import-progress',
    );

    this.logger.log(`已写入数据库: ${current}/${total}`);
  }
}
