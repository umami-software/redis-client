import UmamiRedisClient from './UmamiRedisClient';
import * as process from 'node:process';

const connections = {};
const redisEnabled = !!process.env.REDIS_URL;

function getClient(url: string = process.env.REDIS_URL || ''): UmamiRedisClient {
  const key = url || 'localhost';

  if (!connections[key]) {
    connections[key] = new UmamiRedisClient(url);
  }

  return connections[key];
}

export { UmamiRedisClient, getClient, redisEnabled };
