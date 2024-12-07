import UmamiRedisClient from './UmamiRedisClient';
import * as process from 'node:process';

const REDIS = Symbol();
const redisEnabled = !!process.env.REDIS_URL;

function getClient(url: string = '') {
  return new UmamiRedisClient(url);
}

export { UmamiRedisClient, getClient, redisEnabled, REDIS };
