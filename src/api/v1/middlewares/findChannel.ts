import { NextFunction, Request, Response } from "express";
import GenericError from "../../../errors/GenericError";
import HttpStatusCode from "../../../interfaces/HttpStatusCode";
import Channel from "../../../models/channel";

const findChannel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const channelID = req.params.channelID;
    const channel = await Channel.findOne({ _id: channelID });

    if (!channel) {
        return next(new GenericError("Channel not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    req.bus.channel = channel;

    next();
};

export default findChannel;