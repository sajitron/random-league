import redis from 'redis';
import { Env } from './env';

const { redisURL } = Env.all();

const redisClient = redis.createClient(redisURL);

export default redisClient;
