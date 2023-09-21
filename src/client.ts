import UmamiRedisClient from './UmamiRedisClient';

const REDIS = Symbol();

const url = process.env.REDIS_URL;
const enabled = Boolean(url);

function getClient() {
  const redisClient = new UmamiRedisClient(url as string);

  global[REDIS] = redisClient;

  return redisClient;
}

const client: UmamiRedisClient = enabled ? global[REDIS] || getClient() : null;

export { UmamiRedisClient };

export default client;
