import { createClient } from 'redis';

let redisClient;

const connectRedis = async () => {
    if (!redisClient) {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
        });

        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        redisClient.on('connect', () => console.log('Redis connected'));

        await redisClient.connect();
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
        if (!redisClient || !redisClient.isOpen) return null;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error(`Redis Get Error for key ${key}:`, err);
        return null; // Fallback smoothly if Redis errors
    }
};

const cacheSet = async (key, value, ttlSeconds = 3600) => {
    try {
        if (!redisClient || !redisClient.isOpen) return;
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
        console.error(`Redis Set Error for key ${key}:`, err);
    }
};

const cacheDel = async (key) => {
    try {
        if (!redisClient || !redisClient.isOpen) return;
        await redisClient.del(key);
    } catch (err) {
        console.error(`Redis Del Error for key ${key}:`, err);
    }
};

export { connectRedis, getRedisClient, cacheGet, cacheSet, cacheDel };
