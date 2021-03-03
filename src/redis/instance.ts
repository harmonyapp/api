import redis from "redis";
import redisMock from "redis-mock";

const REDIS_CLIENTS: redis.RedisClient[] = [];

export function createRedisClient(options: {
    url?: string;
    prefix?: string;
} = { url: process.env.REDIS_URI }): redis.RedisClient {
    let client: redis.RedisClient;

    if (process.env.NODE_ENV) {
        client = redisMock.createClient(options);
    } else {
        client = redis.createClient(options);

        registerRedisClient(client);
    }

    return client;
}

export function registerRedisClient(client: redis.RedisClient): void {
    REDIS_CLIENTS.push(client);
}

export function getRedisClients(): redis.RedisClient[] {
    return REDIS_CLIENTS;
}