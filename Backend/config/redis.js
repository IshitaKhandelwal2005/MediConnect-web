import Redis from 'ioredis';

let redisClient;

const connectRedis = async () => {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        redisClient.on('connect', () => console.log('Redis connected'));
    }
    return redisClient;
};

const getRedisClient = () => {
    if (!redisClient) {
        console.warn("Redis client accessed before initialization. Call connectRedis() first.");
    }
    return redisClient;
};

// Helper functions for easy caching
const cacheGet = async (key) => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return null;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error(`Redis Get Error for key ${key}:`, err);
        return null; // Fallback smoothly if Redis errors
    }
};

const cacheSet = async (key, value, ttlSeconds = 3600) => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return;
        await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
        console.error(`Redis Set Error for key ${key}:`, err);
    }
};

const cacheDel = async (key) => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return;
        await redisClient.del(key);
    } catch (err) {
        console.error(`Redis Del Error for key ${key}:`, err);
    }
};

export { connectRedis, getRedisClient, cacheGet, cacheSet, cacheDel };
