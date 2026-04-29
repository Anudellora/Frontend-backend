const { redisClient } = require('../config/redis');

function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cached = await redisClient.get(key);

            if (cached) {
                return res.json({
                    source: 'cache',
                    data: JSON.parse(cached)
                });
            }

            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error('Cache read error:', err);
            next();
        }
    };
}

async function saveToCache(key, data, ttl) {
    try {
        await redisClient.set(key, JSON.stringify(data), { EX: ttl });
    } catch (err) {
        console.error('Cache save error:', err);
    }
}

async function invalidateCache(...keys) {
    try {
        await Promise.all(keys.map(k => redisClient.del(k)));
    } catch (err) {
        console.error('Cache invalidate error:', err);
    }
}

module.exports = { cacheMiddleware, saveToCache, invalidateCache };
