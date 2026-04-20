// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // 1. 指定从 Header 的 Bearer Token 中提取 JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. 是否忽略过期时间（生产环境必须为 false）
      ignoreExpiration: false,
      // 3. 动态从中心化配置中读取秘钥
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  /**
   * validate 方法是 Passport 的核心：
   * 只有 Token 验证通过（签名正确、未过期）后，才会执行该方法。
   * 该方法的返回值会被 Nest 自动挂载到 Request 对象的 user 属性上：req.user
   */
  async validate(payload: IJwtPayload) {
    // 这里可以根据 payload.sub (用户ID) 去数据库查一遍用户最新状态
    // 如果想提升性能，也可以直接返回 payload 里的基础信息
    return {
      userId: payload.sub,
      username: payload.email,
      role: payload.role, // 如果你有权限系统的话
    };
  }
}
