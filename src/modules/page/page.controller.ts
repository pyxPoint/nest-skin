import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Delete,
  Logger,
} from '@nestjs/common';
import { PageService } from './page.service';
import { JwtAuthGuard } from 'src/auth';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { GetiListDto } from 'src/common/dto/common.dto';

@Controller('page')
export class PageController {
  private readonly logger = new Logger(PageController.name);
  constructor(private readonly pageService: PageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async create(@Body() createPageDto: CreatePageDto) {
    return this.pageService.create(createPageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(@Body() updatePageDto: UpdatePageDto) {
    return this.pageService.update(updatePageDto.id, updatePageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getList(@Query() params: GetiListDto) {
    this.logger.log(`getList:${JSON.stringify(params)}`);
    return this.pageService.getList(params);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async delete(@Query('id') id: number) {
    return this.pageService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('find')
  async findById(@Query('id') id: number) {
    return this.pageService.findById(id);
  }
}
