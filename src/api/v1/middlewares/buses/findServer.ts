import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Member from "../../../../models/member";
import Server from "../../../../models/server";

const findServer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const serverID = req.params.serverID;
    const server = await Server.findOne({ _id: serverID });

    if (!server) {
        return next(new GenericError("Server not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    const member = await Member.findOne({ user: req.user.id, server: server.id });

    if (!member) {
        return next(new GenericError("You're not a member of this server").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    req.bus.server = server;
    req.bus.member = member;

    next();
};

export default findServer;