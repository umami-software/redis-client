import { createClient, RedisClientType } from 'redis';
import debug from 'debug';

const log = debug('umami:redis-client');
const DELETED = '__DELETED__';

export class UmamiRedisClient {
  url: string;
  client: RedisClientType;
  isConnected: boolean;

  constructor(url: string) {
    this.url = url;

    const client = createClient({ url });
    client.on('error', err => log(err));

    this.client = client as RedisClientType;
    this.isConnected = false;
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;

      log('Redis connected');
    }
  }

  async get(key: string) {
    await this.connect();

    const data = await this.client.get(key);

    try {
      return JSON.parse(data as string);
    } catch {
      return null;
    }
  }

  async set(key: string, value: any) {
    await this.connect();

    return this.client.set(key, JSON.stringify(value));
  }

  async del(key: string) {
    await this.connect();

    return this.client.del(key);
  }

  async incr(key: string) {
    await this.connect();

    return this.client.incr(key);
  }

  async expire(key: string, seconds: number) {
    await this.connect();

    return this.client.expire(key, seconds);
  }

  async rateLimit(key: string, limit: number, seconds: number): Promise<boolean> {
    await this.connect();

    const res = await this.client.incr(key);

    if (res === 1) {
      await this.client.expire(key, seconds);
    }

    return res >= limit;
  }

  async getCache(key: string, query: () => Promise<any>, time: number | null = null) {
    const obj = await this.get(key);

    if (obj === DELETED) {
      return null;
    }

    if (!obj && query) {
      return query().then(async data => {
        if (data) {
          await this.set(key, data);

          if (time !== null) {
            await this.expire(key, time);
          }
        }

        return data;
      });
    }

    return obj;
  }

  async setCache(key: string, data: any) {
    return this.set(key, data);
  }

  async deleteCache(key: string, soft = false) {
    return soft ? this.set(key, DELETED) : this.del(key);
  }
}

export default UmamiRedisClient;
