import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma'; // 从官方包导入
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// Prisma自动生成的类型，无需手动定义，类型安全
import { user } from '@prisma/client';
import appConfig from '../../config/app.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  // 依赖注入PrismaService
  constructor(
    private readonly prisma: PrismaService,
    @Inject(appConfig.KEY) // 使用配置特有的 KEY 注入，而不是字符串,
    private config: ConfigType<typeof appConfig>,
  ) {}

  // 创建用户（封装业务逻辑：密码简单加密，实际项目用bcrypt）
  async create(createUserDto: CreateUserDto): Promise<Omit<user, 'password'>> {
    const { password, ...userData } = createUserDto;
    // Prisma的create方法，类型安全，参数错误编译期报错
    const salt = await bcrypt.genSalt(this.config.saltRounds);
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: await bcrypt.hash(password, salt), // 示例加密，实际用bcrypt.hash
        role: 'admin',
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // 隐藏密码，返回给前端
    const { password: _, ...result } = user;
    return result;
  }
  async findOneByEmail(email: string): Promise<user> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      this.logger.error(`User email:${email} is not found`);
      throw new NotFoundException(`User email:${email} is not found`);
    }
    return user;
  }
  // 查询所有用户
  async findAll(): Promise<Omit<user, 'password'>[]> {
    this.logger.log('Querying all users...');
    const users = await this.prisma.user.findMany();
    // 隐藏所有用户的密码
    return users.map(({ password, ...rest }) => rest);
  }

  // 根据ID查询用户
  async findOne(id: number): Promise<Omit<user, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      this.logger.error(`User ID:${id} is not found`);
      throw new NotFoundException(`User ID:${id} is not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  // 更新用户
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<user, 'password'>> {
    // 先校验用户是否存在
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    const { password, ...result } = user;
    return result;
  }

  // 删除用户
  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: `用户ID:${id}删除成功` };
  }
}
