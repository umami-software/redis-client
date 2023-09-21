import UmamiRedisClient from './UmamiRedisClient';

const REDIS = Symbol();

const url = process.env.REDIS_URL;
export const enabled = Boolean(url);

export function getClient() {
  if (!enabled) {
    return null;
  }

  const redisClient = new UmamiRedisClient(url as string);

  global[REDIS] = redisClient;

  return redisClient;
}

export const client: UmamiRedisClient = global[REDIS] || getClient();
