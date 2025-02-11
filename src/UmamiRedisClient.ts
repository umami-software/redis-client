import { createClient, RedisClientType } from 'redis';
import debug from 'debug';

export const log = debug('umami:redis-client');

export const DELETED = '__DELETED__';

const logError = (err: unknown) => log(err);

export class UmamiRedisClient {
  url: string;
  client: RedisClientType;
  isConnected: boolean;

  constructor(url: string = '') {
    const client = createClient({ url }).on('error', logError);

    this.url = url;
    this.client = client as RedisClientType;
    this.isConnected = false;
  }

  async connect() {
    if (!this.isConnected) {
      this.isConnected = true;

      await this.client.connect();

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

  async fetch(key: string, query: () => Promise<any>, time: number = 0) {
    const result = await this.get(key);

    if (result === DELETED) {
      return null;
    }

    if (!result && query) {
      return query().then(async data => {
        if (data) {
          await this.store(key, data, time);
        }

        return data;
      });
    }

    return result;
  }

  async store(key: string, data: any, time: number = 0) {
    const result = this.set(key, data);

    if (time > 0) {
      await this.expire(key, time);
    }

    return result;
  }

  async remove(key: string, soft = false) {
    return soft ? this.set(key, DELETED) : this.del(key);
  }
}

export default UmamiRedisClient;
