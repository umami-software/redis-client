import { createClient } from 'redis';
import UmamiRedisClient from './UmamiRedisClient';
import { log } from 'log';

const logError = (err: unknown) => log(err);

export function getClient(url = process.env.REDIS_URL) {
  const client = createClient({ url }).on('error', logError);

  return new UmamiRedisClient(client as any);
}
