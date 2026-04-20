import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const { PORT, NODE_ENV } = process.env;
  return {
    port: !!PORT ? Number(PORT) : 3000,
    env: NODE_ENV || 'development',
    apiPrefix: 'api',
    saltRounds: 10,
    fileSizeLimit: 10 * 1024 * 1024,
  };
});
