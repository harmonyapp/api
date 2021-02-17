import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Invite from "../../../../models/invite";

const findInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const inviteCode = req.params.inviteCode;
    const invite = await Invite.findOne({ code: inviteCode });

    if (!invite) {
        return next(new GenericError("Invite not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    req.bus.invite = invite;

    return next();
};

export default findInvite;