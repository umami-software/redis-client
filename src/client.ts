import { createClient } from 'redis';
import debug from 'debug';

const log = debug('umami:redis-client');
const REDIS = Symbol();
const DELETED = '__DELETED__';

let redis;
const redisUrl = process.env.REDIS_URL;
const enabled = Boolean(redisUrl);

async function getClient(url: string, isGlobal = true) {
  if (!enabled) {
    return null;
  }

  const client = createClient({ url });
  client.on('error', err => log(err));
  await client.connect();

  if (process.env.NODE_ENV !== 'production' && isGlobal) {
    global[REDIS] = client;
  }

  log('Redis initialized');

  return client;
}

async function get(key: string, redisClient?) {
  if (!redisClient) {
    await connect();
  }

  const data = await (redisClient || redis).get(key);

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function set(key: string, value: any, redisClient?) {
  if (!redisClient) {
    await connect();
  }

  return (redisClient || redis).set(key, JSON.stringify(value));
}

async function del(key: string, redisClient?) {
  if (!redisClient) {
    await connect();
  }

  return (redisClient || redis).del(key);
}

async function incr(key: string, redisClient?) {
  if (!redisClient) {
    await connect();
  }

  return (redisClient || redis).incr(key);
}

async function expire(key: string, seconds: number, redisClient?) {
  if (!redisClient) {
    await connect();
  }

  return (redisClient || redis).expire(key, seconds);
}

async function rateLimit(
  key: string,
  limit: number,
  seconds: number,
  redisClient?,
): Promise<boolean> {
  if (!redisClient) {
    await connect();
  }

  const res = await (redisClient || redis).incr(key);

  if (res === 1) {
    await (redisClient || redis).expire(key, seconds);
  }

  return res >= limit;
}

async function fetchObject(
  key: string,
  query: () => Promise<any>,
  time: number | null = null,
  redisClient?,
) {
  const obj = await get(key, redisClient);

  if (obj === DELETED) {
    return null;
  }

  if (!obj && query) {
    return query().then(async data => {
      if (data) {
        await set(key, data, redisClient);

        if (time !== null) {
          await expire(key, time, redisClient);
        }
      }

      return data;
    });
  }

  return obj;
}

async function storeObject(key: string, data: any, redisClient?) {
  return set(key, data, redisClient);
}

async function deleteObject(key: string, soft = false, redisClient?) {
  return soft ? set(key, DELETED, redisClient) : del(key, redisClient);
}

async function connect() {
  if (!redis && enabled) {
    redis = global[REDIS] || (await getClient(redisUrl as string));
  }

  return redis;
}

export default {
  REDIS,
  client: redis,
  enabled,
  log,
  getClient,
  connect,
  get,
  set,
  del,
  incr,
  expire,
  rateLimit,
  fetchObject,
  storeObject,
  deleteObject,
};
