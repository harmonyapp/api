import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Channel from "../../../../models/channel";
import Member from "../../../../models/member";
import Server from "../../../../models/server";
import { ChannelTypes } from "../../../../util/Constants";

type ChannelType = typeof ChannelTypes[keyof typeof ChannelTypes];

const getChannel = async (req: Request) => {
    if (req.bus.channel) return req.bus.channel;

    const channelID = req.params.channelID;
    const channel = await Channel.findOne({ _id: channelID });

    return channel;
};

function findChannel(options: { type: ChannelType });
function findChannel(options: { types: ChannelType[] });
function findChannel(options: {
    type?: ChannelType,
    types?: ChannelType[]
}) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const channel = await getChannel(req);

        if (!channel) {
            return next(new GenericError("Channel not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
        }

        if ((options.type && channel.type !== options.type) || (options.types && options.types.indexOf(channel.type) === -1)) {
            return next(new GenericError("Channel type not supported for this endpoint"));
        }

        if (channel.type !== ChannelTypes.DM && channel.type !== ChannelTypes.GROUP_DM) {
            const server = await Server.findOne({ _id: channel.server });

            if (!server) {
                return next(new GenericError("Server not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
            }

            const member = await Member.findOne({ user: req.user.id, server: server.id });

            if (!member) {
                return next(new GenericError("You're not a member of this server").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
            }

            req.bus.server = server;
            req.bus.server_member = member;

            if (!member.hasPermission("VIEW_CHANNEL")) {
                return next(new GenericError("You don't have permission to view this channel"));
            }
        }

        req.bus.channel = channel;

        next();
    };
}

export default findChannel;