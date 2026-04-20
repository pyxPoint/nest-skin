import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import appConfig from '../../config/app.config';
import type { ConfigType } from '@nestjs/config';
import { CreateNaviDto, UpdateNaviDto } from './dto/navi.dto';
import { buildTree, generateUrl, buildParentList } from 'src/common/utils';
import { RedisService } from '../redis/redis.service';
import tryCatch from 'await-to-js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateNavigationItem,
  GetNavigationParams,
  NavigationItem,
  NavigationItemData,
  SearchNavigationListItem,
} from './interface/navi.interface';
import {
  NAV_CACHE_KEY,
  NAV_CACHE_KEY_HASH,
  NAV_CACHE_KEY_LIST,
  NAV_CACHE_KEY_SEARCH,
  SKIP_DEFAULT,
  TAKE_DEFAULT,
} from 'src/common/constants';
import { ChainableCommander } from 'ioredis';

@Injectable()
export class NaviService {
  private readonly logger = new Logger(NaviService.name);
  private isRefreshing = false;
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @Inject(appConfig.KEY) // 使用配置特有的 KEY 注入，而不是字符串,
    private config: ConfigType<typeof appConfig>,
  ) {}
  private async syncIncrementalCache({
    pipeline = this.redisService.pipeline(),
    batchTag,
  }: {
    pipeline?: ChainableCommander;
    batchTag?: string;
  }) {
    let cursorId: number | undefined;

    let count = 0;
    while (true) {
      const [err, batch] = await tryCatch(
        this.prisma.navigation.findMany({
          where: { batchTag: !!batchTag ? batchTag : undefined },
          select: {
            id: true,
            title: true,
            url: true,
            order: true,
            parentId: true,
            mainMenu: true,
            breadcrumbs: true,
            sideBar: true,
          },
          take: TAKE_DEFAULT, // 每次只读 1000 条，保护内存
          skip: cursorId ? 1 : SKIP_DEFAULT,
          cursor: cursorId ? { id: cursorId } : undefined,
          orderBy: { id: 'asc' },
        }),
      );

      if (err) throw err;
      if (batch.length === 0) break;
      count += batch.length;
      // allData.push(...batch);
      for (const item of batch) {
        pipeline.zadd(NAV_CACHE_KEY_LIST, item.order, item.id.toString());
        pipeline.hset(
          NAV_CACHE_KEY_HASH,
          item.id.toString(),
          JSON.stringify(item),
        );
      }

      cursorId = batch[batch.length - 1].id;
      await new Promise((resolve) => setImmediate(resolve));
    }
    await pipeline.exec();
    this.logger.log(`Refresh cache ${NAV_CACHE_KEY} success, count: ${count}`);
  }
  async create(createNaviDto: CreateNaviDto) {
    const { title } = createNaviDto,
      url = generateUrl(title);
    this.logger.log(`Start create navi, url: ${url}`);
    if (await this.findByUrl(url)) {
      throw new NotFoundException('Navi title already exists');
    }
    const [err, navi] = await tryCatch(
      this.prisma.navigation.create({
        data: {
          ...createNaviDto,
          url,
          status: 1,
        },
      }),
    );
    if (err) throw new NotFoundException('Create navi failed');
    await this.clearCache(NAV_CACHE_KEY);
    await this.clearCache(NAV_CACHE_KEY_SEARCH);
    return navi;
  }
  async delete(id: number) {
    const [err] = await tryCatch(
      this.prisma.navigation.delete({
        where: {
          id,
        },
      }),
    );
    if (err) throw new NotFoundException('Delete navi failed');
    await this.clearSingleCache(id.toString());
  }
  async findAll() {
    const [err, navis] = await tryCatch(this.prisma.navigation.findMany());
    if (err) throw err;
    return navis;
  }
  async findOne(id: number) {
    const [err, navi] = await tryCatch(
      this.prisma.navigation.findUnique({
        where: { id },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      }),
    );
    if (err) throw new NotFoundException('Navi not found');
    return navi;
  }
  async update(id: number, updateNaviDto: UpdateNaviDto) {
    if (!this.findOne(id)) {
      throw new NotFoundException('Navi not found');
    }
    const [err, navi] = await tryCatch(
      this.prisma.navigation.update({
        where: { id },
        data: updateNaviDto,
      }),
    );
    if (err) throw new NotFoundException('Update navi failed');
    await this.updateCache(navi);
    return navi;
  }
  async refreshCache() {
    // 使用游标分页，保证性能恒定
    const pipeline = this.redisService.pipeline();
    pipeline.del(NAV_CACHE_KEY_LIST);
    pipeline.del(NAV_CACHE_KEY_HASH);
    await this.syncIncrementalCache({ pipeline });
  }
  async getNaviByPage(offset: number, limit: number) {
    // 1. 从 Set 中获取指定范围的 ID 列表 (O(log(N)+M))
    // 例如 offset=500, limit=100 -> 获取索引 500 到 599 的 ID
    this.logger.log(
      `Start get navi by page, offset: ${offset}, limit: ${limit}`,
    );
    const ids = await this.redisService.zrange(
      NAV_CACHE_KEY_LIST,
      offset,
      offset + limit - 1,
    );
    this.logger.log(
      `Get ${ids.length} navi ids from list ${NAV_CACHE_KEY_LIST}`,
    );

    if (!ids || ids.length === 0) return [];

    // 2. 根据 ID 列表，从 Hash 中一次性批量取出详情 (O(M))
    const details = await this.redisService.hmget(NAV_CACHE_KEY_HASH, ...ids);

    // 3. 将字符串转回对象并返回
    return details
      .filter((item) => item !== null)
      .map((item) => JSON.parse(item));
  }
  async getData(offset: number, limit: number) {
    const cached = await this.getNaviByPage(offset, limit);
    this.logger.log(
      `Get ${cached.length} navi from cache from list ${NAV_CACHE_KEY_LIST}`,
    );
    if (cached.length > 0) return cached;

    // 如果正在有人查数据库，其他人等待，不要重复查询
    if (this.isRefreshing) {
      // 简单处理：延迟重试
      await new Promise((res) => setTimeout(res, 100));
      return this.getData(offset, limit);
    }

    this.isRefreshing = true;
    const [err] = await tryCatch(this.refreshCache());
    this.isRefreshing = false;
    if (err) {
      this.logger.error(`Refresh cache ${NAV_CACHE_KEY} failed, err: ${err}`);
      throw err;
    }
    const data = await this.getNaviByPage(offset, limit);
    return data;
  }
  async clearCache(key: string) {
    const keys = await this.redisService.keys(key);
    if (keys.length === 0) return;
    await this.redisService.delAllKeys(keys);
    await this.getData(0, 0);
    return 'Cache cleared';
  }
  async updateCache(item: SearchNavigationListItem) {
    await this.redisService.hset(
      NAV_CACHE_KEY_HASH,
      item.id.toString(),
      JSON.stringify(item),
    );
  }
  async clearSingleCache(id: string) {
    const pipeline = this.redisService.pipeline();
    pipeline.zrem(NAV_CACHE_KEY_LIST, id);
    pipeline.hdel(NAV_CACHE_KEY_HASH, id);
    await pipeline.exec();
  }
  async getSearchList(title: string, start: number = 0, size: number = 10) {
    const data = await this.getData(0, 0);
    const alllist = data.filter((item) => item.title.includes(title));
    this.logger.log(
      `Get search list success, title: ${title}, start: ${start}, length: ${alllist.length}`,
    );
    const list = alllist.slice(start, start + size);
    const listData: NavigationItemData = {
      list,
      total: alllist.length,
      hasMore: alllist.length > start + size,
    };
    return listData;
  }
  async getCurrentList(
    parentId: number = -1,
    start: number = 0,
    size: number = 10,
  ) {
    //await this.clearCache('navi:*');
    const naviList: any = await this.getData(0, 0);
    const list = naviList
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.order - b.order);
    const data: NavigationItemData = {
      list: buildParentList(list.slice(start, start + size), naviList),
      total: list.length,
      hasMore: list.length > start + size,
    };
    return data;
  }
  async getAllList(id?: number, start?: number, size?: number) {
    this.logger.log('Start get all navi list');
    return await this.getCurrentList(id, start, size);
  }
  async getList({ title, id, start, size }: GetNavigationParams) {
    this.logger.log(`Start get navi list, title: ${title}`);
    if (!!title) return await this.getSearchList(title, start, size);
    return await this.getAllList(id, start, size);
  }
  async getParentList() {
    return await this.prisma?.navigation.findMany({
      select: {
        id: true,
        title: true,
      },
    });
  }
  async findByUrl(url: string) {
    const [err, navi] = await tryCatch(
      this.prisma.navigation.findUnique({
        where: { url },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      }),
    );
    if (err) throw err;
    return navi;
  }

  async batchImport(
    count: number = 10,
    parentId: number = 7,
    prefix: string = 'navi-new',
  ): Promise<{ success: boolean; count: number }> {
    this.logger.log(
      `Start batch import ${count} navi, parentId: ${parentId}, prefix: ${prefix}`,
    );
    const BATCH_SIZE = 1000;
    let totalImported = 0;
    const batchTag = uuidv4();
    for (let i = 0; i < count; i += BATCH_SIZE) {
      const batchCount = Math.min(BATCH_SIZE, count - i);
      const data: CreateNavigationItem[] = [];

      for (let j = 0; j < batchCount; j++) {
        const num = i + j + 1;
        data.push({
          title: `${prefix} ${num}`,
          url: `${prefix}-${num}.html`,
          status: 1,
          order: num,
          mainMenu: Math.random() > 0.5,
          breadcrumbs: Math.random() > 0.5,
          sideBar: Math.random() > 0.5,
          parentId,
          batchTag,
        });
      }

      const [err] = await tryCatch(
        this.prisma.navigation.createMany({
          data,
          skipDuplicates: true,
        }),
      );
      if (err) throw err;
      totalImported += batchCount;
      this.logger.log(`已导入 ${totalImported}/${count} 条数据`);
    }
    this.syncIncrementalCache({ batchTag });
    return { success: true, count: totalImported };
  }
}
