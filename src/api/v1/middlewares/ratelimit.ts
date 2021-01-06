import rateLimit from "express-rate-limit";
import HttpStatusCode from "../../../interfaces/HttpStatusCode";
import GenericError from "../../../errors/GenericError";

const ratelimit = (options: rateLimit.Options = {
    windowMs: 1 * 60 * 1000,
    max: 100,
    headers: true
}): rateLimit.RateLimit => {
    Object.assign(options, {
        handler(req, res, next) {
            return next(new GenericError("Too many requests, please try again in a bit").setHttpStatusCode(HttpStatusCode.TOO_MANY_REQUESTS));
        }
    });

    return rateLimit(options);
};

export default ratelimit;