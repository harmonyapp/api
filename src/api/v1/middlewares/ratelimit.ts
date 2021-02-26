import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import HttpStatusCode from "../../../interfaces/HttpStatusCode";
import GenericError from "../../../errors/GenericError";
import { createRedisClient } from "../../../redis/instance";

const ratelimit = (options: rateLimit.Options = {
    windowMs: 1 * 60 * 1000,
    max: 100,
    headers: true
}): rateLimit.RateLimit => {
    Object.assign(options, {
        handler(req, res, next) {
            return next(new GenericError("Too many requests, please try again in a bit").setHttpStatusCode(HttpStatusCode.TOO_MANY_REQUESTS));
        },
        skip() {
            return process.env.NODE_ENV !== "production";
        },
        store: new RedisStore({
            expiry: options.windowMs / 1000,
            client: createRedisClient({
                url: process.env.REDIS_URI
            })
        })
    } as rateLimit.Options);

    return rateLimit(options);
};

export default ratelimit;