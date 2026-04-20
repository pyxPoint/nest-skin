import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB, REDIS_URL } =
    process.env;
  return {
    host: REDIS_HOST || 'localhost',
    port: !!REDIS_PORT ? Number(REDIS_PORT) : 6379,
    password: REDIS_PASSWORD || undefined,
    db: !!REDIS_DB ? Number(REDIS_DB) : 0,
    maxRetriesPerRequest: null,
    url: REDIS_URL || null,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
});
