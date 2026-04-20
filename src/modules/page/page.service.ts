import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { generateUrl } from 'src/common/utils';
import { GetiListDto } from 'src/common/dto/common.dto';

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name);
  constructor(private readonly prisma: PrismaService) {}
  async create(createPageDto: CreatePageDto) {
    const { title } = createPageDto,
      url = generateUrl(title);
    if (await this.findByUrl(url)) {
      throw new NotFoundException('Page title already exists');
    }
    return await (this.prisma as PrismaService).page.create({
      data: {
        ...createPageDto,
        url,
        status: 1,
      },
    });
  }
  async update(id: number, updatePageDto: UpdatePageDto) {
    return await (this.prisma as PrismaService).page.update({
      where: {
        id,
      },
      data: {
        ...updatePageDto,
      },
    });
  }
  async delete(id: number) {
    return await (this.prisma as PrismaService).page.delete({
      where: {
        id,
      },
    });
  }
  async findByUrl(url: string) {
    this.logger.log(`findByUrl: ${url}`);
    return await (this.prisma as PrismaService).page.findUnique({
      where: {
        url,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async findById(id: number) {
    this.logger.log(`findById: ${id}`);
    return await (this.prisma as PrismaService).page.findUnique({
      where: {
        id,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async getList(params: GetiListDto) {
    const {
      currentPage = 1,
      pageSize = 10,
      title,
      sortBy = 'id',
      sortOrder = 'desc',
    } = params;
    return await (this.prisma as PrismaService).page.findMany({
      where: {
        title: { contains: title },
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }
}
