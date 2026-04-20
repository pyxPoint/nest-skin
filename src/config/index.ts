// src/config/index.ts
import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';
import uploadConfig from './upload.config';

export const configs = [
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  uploadConfig,
];
