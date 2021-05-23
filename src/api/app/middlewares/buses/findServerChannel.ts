import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import Member from "../../../../models/member";
import Server from "../../../../models/server";

const findServerChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    const channel = req.bus.channel;

    const server = await Server.findOne({ _id: channel.server });
    const member = await Member.findOne({ server: server.id, user: user.id });

    if (!member) {
        return next(new GenericError("You are not a member of this server"));
    }

    if (!await member.hasPermission("VIEW_CHANNEL", { server, channel })) {
        return next(new GenericError("You don't have permission to interact with this channel"));
    }

    req.bus.server = server;
    req.bus.server_member = member;

    return next();
};

export default findServerChannel;