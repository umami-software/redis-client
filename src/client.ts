import UmamiRedisClient from './UmamiRedisClient';

const REDIS = Symbol();
const enabled = !!process.env.REDIS_URL;

export function getClient(url: string = '') {
  return new UmamiRedisClient(url);
}

const client: UmamiRedisClient = enabled && (global[REDIS] || getClient(process.env.REDIS_URL));

if (!global[REDIS]) {
  global[REDIS] = client;
}

export { UmamiRedisClient };

export default { enabled, client, REDIS };
