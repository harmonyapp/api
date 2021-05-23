import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Channel from "../../../../models/channel";
import { ChannelTypes } from "../../../../util/Constants";
import findDMChannel from "./findDMChannel";
import findServerChannel from "./findServerChannel";

type ChannelType = typeof ChannelTypes[keyof typeof ChannelTypes];

const getChannel = async (req: Request) => {
    if (req.bus.channel) return req.bus.channel;

    const channelID = req.params.channelID;
    const channel = await Channel.findOne({ _id: channelID });

    return channel;
};

function findChannel(options: {
    types?: ChannelType[],
    passthrough?: boolean
}) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const channel = await getChannel(req);

        const dmChannelTypes = [ChannelTypes.DM, ChannelTypes.GROUP_DM] as ChannelType[];

        if (!channel) {
            return next(new GenericError("Channel not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
        }

        if ((options.types && options.types.indexOf(channel.type) === -1)) {
            if (options.passthrough) {
                return next("route");
            }

            return next(new GenericError("Channel type not supported for this endpoint"));
        }

        req.bus.channel = channel;

        if (dmChannelTypes.indexOf(channel.type) !== -1) {
            return await findDMChannel(req, res, next);
        } else {
            return await findServerChannel(req, res, next);
        }
    };
}

export default findChannel;