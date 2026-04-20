import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  Delete,
  Logger,
} from '@nestjs/common';
import { NaviService } from './navi.service';
import {
  AddBatchImportDto,
  CreateNaviDto,
  DeleteNaviDto,
  UpdateNaviDto,
} from './dto/navi.dto';
import { JwtAuthGuard } from 'src/auth';
import { GetNaviListDto } from './dto/navi.dto';
import { RateLimitConfig } from 'src/common/decorators/rate-limit.decorator';

@Controller('navi')
export class NaviController {
  private readonly logger = new Logger(NaviController.name);
  constructor(private readonly naviService: NaviService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @RateLimitConfig(10, 60) // 60秒内允许 10 次请求
  async create(@Body() createNaviDto: CreateNaviDto) {
    return this.naviService.create(createNaviDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(@Body() updateNaviDto: UpdateNaviDto) {
    return this.naviService.update(updateNaviDto.id, updateNaviDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async delete(@Query() query: DeleteNaviDto) {
    return this.naviService.delete(query.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getList(@Query() query: GetNaviListDto) {
    return this.naviService.getList(query);
  }
  @UseGuards(JwtAuthGuard)
  @Get('parent-list')
  async getParentList() {
    return this.naviService.getParentList();
  }
  @UseGuards(JwtAuthGuard)
  @Get('find')
  async findById(@Query('id') id: string) {
    return this.naviService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('batch-import')
  @RateLimitConfig(10000, 3600) // 1小时内允许 10000 次请求
  async batchImport(@Body() body: AddBatchImportDto) {
    const count = body.count || 2;
    const parentId = body.parentId || 7;
    return this.naviService.batchImport(count, parentId, body.prefix);
  }

  @UseGuards(JwtAuthGuard)
  @Post('clear-cache')
  async clearCache() {
    return this.naviService.clearCache('navi:*');
  }
}
