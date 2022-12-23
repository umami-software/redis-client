import { createClient } from 'redis';
import debug from 'debug';

const log = debug('umami:redis-client');
const REDIS = Symbol();

let redis;
const url = process.env.REDIS_URL;
const enabled = Boolean(url);

async function getClient() {
  if (!enabled) {
    return null;
  }

  const client = createClient({ url });
  client.on('error', err => log(err));
  await client.connect();

  if (process.env.NODE_ENV !== 'production') {
    global[REDIS] = client;
  }

  log('Redis initialized');

  return client;
}

async function get(key: string) {
  await connect();

  const data = await redis.get(key);

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function set(key: string, value: any) {
  await connect();

  return redis.set(key, JSON.stringify(value));
}

async function del(key: string) {
  await connect();

  return redis.del(key);
}

async function incr(key: string) {
  await connect();

  return redis.incr(key);
}

async function expire(key: string, seconds: number) {
  await connect();

  return redis.expire(key, seconds);
}

async function rateLimit(key: string, limit: number, seconds: number): Promise<boolean> {
  await connect();

  const res = await redis.incr(key);

  if (res === 1) {
    await redis.expire(key, seconds);
  }

  return res >= limit;
}

async function connect() {
  if (!redis && enabled) {
    redis = global[REDIS] || (await getClient());
  }

  return redis;
}

export default {
  REDIS,
  client: redis,
  enabled,
  log,
  connect,
  get,
  set,
  del,
  incr,
  expire,
  rateLimit
};
