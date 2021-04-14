import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Ban from "../../../../models/ban";

const findBan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.bus.user;
    const server = req.bus.server;

    const ban = await Ban.findOne({ user: user.id, server: server.id });

    if (!ban) {
        return next(new GenericError("User is not banned").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    req.bus.ban = ban;

    return next();
};

export default findBan;