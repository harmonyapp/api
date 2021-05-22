import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";

const findDMChannel = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    const channel = req.bus.channel;

    if (channel.recipients.indexOf(user.id) === -1) {
        return next(new GenericError("You are not a participant of this channel"));
    }

    return next();
};

export default findDMChannel;