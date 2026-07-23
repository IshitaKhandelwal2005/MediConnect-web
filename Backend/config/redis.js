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

const cacheDeleteByPrefix = async (prefix) => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return;

        let cursor = '0';
        do {
            const [nextCursor, keys] = await redisClient.scan(
                cursor,
                'MATCH',
                `${prefix}*`,
                'COUNT',
                100
            );

            cursor = nextCursor;

            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } while (cursor !== '0');
    } catch (err) {
        console.error(`Redis Prefix Delete Error for prefix ${prefix}:`, err);
    }
};

const OTP_REQUEST_LIMIT = 3;
const OTP_REQUEST_WINDOW_SECONDS = 15 * 60;
const OTP_BLOCK_SECONDS = 30 * 60;
const OTP_VALUE_TTL_SECONDS = 10 * 60;

const normalizeOtpEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeOtpScope = (scope) => String(scope || 'default').trim().toLowerCase();

const getOtpKeys = (email, scope = 'default') => {
    const normalizedEmail = normalizeOtpEmail(email);
    const normalizedScope = normalizeOtpScope(scope);
    return {
        otpKey: `otp:${normalizedScope}:${normalizedEmail}`,
        countKey: `otp:count:${normalizedScope}:${normalizedEmail}`,
        blockKey: `otp:block:${normalizedScope}:${normalizedEmail}`,
    };
};

const requestOtpThrottle = async (email, scope = 'default') => {
    try {
        if (!redisClient || redisClient.status !== 'ready') {
            return { success: false, message: 'OTP service unavailable' };
        }

        const { countKey, blockKey, otpKey } = getOtpKeys(email, scope);

        const blockedTtl = await redisClient.ttl(blockKey);
        if (blockedTtl > 0) {
            return {
                success: false,
                blocked: true,
                retryAfterSeconds: blockedTtl,
                message: `Too many OTP requests. Please try again in ${Math.ceil(blockedTtl / 60)} minute(s).`
            };
        }

        const requestCount = await redisClient.incr(countKey);
        if (requestCount === 1) {
            await redisClient.expire(countKey, OTP_REQUEST_WINDOW_SECONDS);
        }

        if (requestCount > OTP_REQUEST_LIMIT) {
            await redisClient.set(blockKey, '1', 'EX', OTP_BLOCK_SECONDS);
            await redisClient.del(countKey, otpKey);
            return {
                success: false,
                blocked: true,
                retryAfterSeconds: OTP_BLOCK_SECONDS,
                message: `Too many OTP requests. Please try again in ${Math.ceil(OTP_BLOCK_SECONDS / 60)} minute(s).`
            };
        }

        return { success: true, remainingRequests: OTP_REQUEST_LIMIT - requestCount };
    } catch (err) {
        console.error('OTP throttle error:', err);
        return { success: false, message: 'OTP service unavailable' };
    }
};

const storeOtp = async (email, otp, scope = 'default', ttlSeconds = OTP_VALUE_TTL_SECONDS) => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return false;
        const { otpKey } = getOtpKeys(email, scope);
        await redisClient.set(otpKey, JSON.stringify({ otp: String(otp), createdAt: Date.now() }), 'EX', ttlSeconds);
        return true;
    } catch (err) {
        console.error('OTP store error:', err);
        return false;
    }
};

const getOtp = async (email, scope = 'default') => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return null;
        const { otpKey } = getOtpKeys(email, scope);
        const raw = await redisClient.get(otpKey);
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error('OTP get error:', err);
        return null;
    }
};

const verifyOtp = async (email, otp, scope = 'default') => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return false;
        const { otpKey, countKey } = getOtpKeys(email, scope);
        const record = await getOtp(email, scope);
        if (!record || String(record.otp) !== String(otp)) {
            return false;
        }

        await redisClient.del(otpKey, countKey);
        return true;
    } catch (err) {
        console.error('OTP verify error:', err);
        return false;
    }
};

const clearOtp = async (email, scope = 'default') => {
    try {
        if (!redisClient || redisClient.status !== 'ready') return;
        const { otpKey } = getOtpKeys(email, scope);
        await redisClient.del(otpKey);
    } catch (err) {
        console.error('OTP clear error:', err);
    }
};

export { connectRedis, getRedisClient, cacheGet, cacheSet, cacheDel, cacheDeleteByPrefix, requestOtpThrottle, storeOtp, getOtp, verifyOtp, clearOtp };
