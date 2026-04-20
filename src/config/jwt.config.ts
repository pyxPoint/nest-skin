// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default_secret',
  expiresIn: '3600s',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: '86400s',
}));
