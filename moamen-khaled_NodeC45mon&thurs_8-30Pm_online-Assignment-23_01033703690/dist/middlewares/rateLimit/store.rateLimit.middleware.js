import { redisService } from "../../common/services/index.js";
export const redisStore = (windowMs) => {
    const ttl = Math.ceil(windowMs / 1000);
    return {
        async increment(key) {
            const count = await redisService.incr(key);
            if (count === 1) {
                await redisService.expire({ key, seconds: ttl });
            }
            return {
                totalHits: count,
                resetTime: new Date(Date.now() + windowMs),
            };
        },
        async decrement(key) {
            await redisService.decr(key);
        },
        async resetKey(key) {
            await redisService.del([key]);
        },
    };
};
