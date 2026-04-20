import { Inject, Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { type ConfigType } from '@nestjs/config';
import redisConfig from 'src/config/redis.config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private config: ConfigType<typeof redisConfig>,
  ) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }
  async keys(key: string): Promise<string[]> {
    return await this.client.keys(key);
  }
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.client.set(key, value, 'EX', ttl);
    }
    return await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }
  async delAllKeys(keys: string[]): Promise<number> {
    return await this.client.del(...keys);
  }
  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }
  async incrBy(key: string, value: number): Promise<number> {
    return await this.client.incrby(key, value);
  }
  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }
  async hmget(key: string, ...fields: string[]): Promise<(string | null)[]> {
    return await this.client.hmget(key, ...fields);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return await this.client.hdel(key, ...fields);
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return await this.client.lpush(key, ...values);
  }
  async lrem(key: string, count: number, value: string): Promise<number> {
    return await this.client.lrem(key, count, value);
  }
  async rpush(key: string, ...values: string[]): Promise<number> {
    return await this.client.rpush(key, ...values);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lrange(key, start, stop);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return await this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return await this.client.sismember(key, member);
  }

  async publish(channel: string, message: string): Promise<number> {
    return await this.client.publish(channel, message);
  }
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zadd(key, score, member);
  }
  async zrem(key: string, ...members: string[]): Promise<number> {
    return await this.client.zrem(key, ...members);
  }
  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.zrange(key, start, stop);
  }
  pipeline() {
    return this.client.pipeline();
  }
}
