import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Ban from "../../../../models/ban";
import Invite from "../../../../models/invite";

const findInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const inviteCode = req.params.inviteCode;
    const invite = await Invite.findOne({ code: inviteCode });

    if (!invite) {
        return next(new GenericError("Invite not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    const isBanned = await Ban.exists({ server: invite.server, user: req.user.id });

    if (isBanned) {
        return next(new GenericError("You are banned from this server").setHttpStatusCode(HttpStatusCode.FORBIDDEN));
    }

    req.bus.invite = invite;

    return next();
};

export default findInvite;