// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IJwtPayload } from './interfaces/jwt-payload.interface';
import type { IUserInfo } from 'src/modules/user/interfaces/user-info.interface';
import type { UserRole } from 'src/common/types/role.type';
import { ConfigService } from '@nestjs/config';
import { EXPRIES_IN } from 'src/common/constants';
import { LoginUserDto, RegisterUserDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private configService: ConfigService,
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(email: string, pass: string): Promise<IUserInfo | null> {
    // 1. 调用 UserService 查找用户
    const user = await this.usersService.findOneByEmail(email);
    this.logger.log(`pass(${pass})  base(${user.password})`);
    // 2. 校验密码（通常使用 bcrypt）
    if (!(user && (await bcrypt.compare(pass, user.password)))) return null;
    const { status, createdAt, updatedAt, role, ...result } = user;

    return { ...result, role: role as UserRole };
  }
  private generateRefreshToken(userId: number): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret') as any, // 建议用不同的 secret
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') as any,
      // 建议用不同的 expiresIn
    } as any);
  }
  async register(user: RegisterUserDto) {
    this.logger.log(`register(${user.email})`);
    return this.usersService.create(user);
  }
  getPass(user: Omit<IUserInfo, 'password'>) {
    const payload: IJwtPayload = {
      email: user.email,
      sub: user.id, // JWT 标准字段，存放唯一标识
      role: user.role, // 可选：将权限信息放入 Token
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.generateRefreshToken(user.id),
    };
  }
  async login(user: LoginUserDto) {
    this.logger.log(`login(${user.email})`);
    const userBase: IUserInfo | null = await this.validateUser(
      user.email,
      user.password,
    );
    if (!userBase)
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or Password is incorrect',
      });
    return this.getPass(userBase);
  }

  async refreshToken(refreshToken: string) {
    try {
      const { sub } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
      const user = await this.usersService.findOne(sub);
      if (!user) throw new UnauthorizedException('User not found');
      return this.getPass({ ...user, role: user.role as UserRole });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
