import { Response, Request, NextFunction } from "express";
import { matchedData } from "express-validator";
import BaseController from "../../../BaseController";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import ErrorMessages from "../../../../../../errors/Messages";
import Channel from "../../../../../../models/channel";
import FieldError from "../../../../../../errors/FieldError";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";
import { ChannelTypes } from "../../../../../../util/Constants";
import GenericError from "../../../../../../errors/GenericError";
import isNumeric from "../../../../../../helpers/isNumeric";

class ServerChannelsController extends BaseController {
    public static async getChannels(req: Request, res: Response): ControllerReturnPromise {
        const channels = await Channel.find({ server: req.bus.server.id });

        return res.send({ channels });
    }

    public static async createChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;

        const type = req.body.type;

        if (!type) {
            return next(new FieldError("type", ErrorMessages.REQUIRED_FIELD));
        }

        if ([ChannelTypes.SERVER_TEXT, ChannelTypes.SERVER_VOICE, ChannelTypes.SERVER_CATEGORY].indexOf(type) === -1) {
            return next(new FieldError("type", "Invalid channel type"));
        }

        const channelData = matchedData(req);

        const channel = new Channel({
            ...channelData,
            type: type,
            server: server.id
        });

        // We need to validate the channel before we proceed, to make sure no non-applicable properties are provided
        try {
            await channel.validate();
        } catch (error) {
            return next(error);
        }

        const siblings = await channel.getSiblings();

        channel.position = siblings.length;

        try {
            await channel.save();
        } catch (error) {
            return next(error);
        }

        await server.mendChannelPositions({
            channel_type: channel.type === ChannelTypes.SERVER_CATEGORY ? "category" : "channel",
            parent_id: channel.parent,
            save: true
        });

        const updatedChannel = await Channel.findOne({ _id: channel.id });

        return res.status(HttpStatusCode.CREATED).send({ channel: updatedChannel });
    }

    public static async updateChannels(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channelData: { id: string; position: number; }[] = req.body;
        const server = req.bus.server;

        if (!Array.isArray(channelData)) {
            return next(new GenericError("This endpoint expects an array"));
        }

        if (channelData.length < 2) {
            return next(new GenericError("You cannot edit less than 2 channels"));
        }

        for (const channel of channelData) {
            const missingID = !Object.prototype.hasOwnProperty.call(channel, "id");
            const missingPosition = !Object.prototype.hasOwnProperty.call(channel, "position");

            if (missingID || missingPosition) {
                return next(new FieldError(missingID ? "id" : "position", "This field is required"));
            }

            if (!isNumeric(channel.position)) {
                return next(new FieldError("position", "This field expects a number"));
            }
        }

        const serverChannels = await Channel.find({ server: server.id });

        const affectedChannels = serverChannels.filter((channel) => {
            return channelData.findIndex((data) => {
                return data.id === channel.id;
            }) !== -1;
        });

        if (affectedChannels.length !== channelData.length) {
            return next(new GenericError("One or more of the provided channel ID's are not valid"));
        }

        if (!affectedChannels.every((channel) => channel.parent === affectedChannels[0].parent)) {
            return next(new GenericError("All channels must be in the same category"));
        }

        if (!affectedChannels.every((channel) => channel.isSwappableWith(affectedChannels[0].type))) {
            return next(new GenericError("You can't mix category channels with text/voice channels"));
        }

        const updatedChannelDocuments = affectedChannels.map((serverChannel) => {
            const updatedChannelData = channelData.find((channel) => channel.id === serverChannel.id);

            if (updatedChannelData) {
                serverChannel.position = updatedChannelData.position;
            }

            return serverChannel;
        });

        const positionArray = updatedChannelDocuments.map((updatedChannel) => updatedChannel.position);
        const overlappingPositions = positionArray.some((position, index) => {
            return positionArray.indexOf(position, index + 1) !== -1;
        });

        if (overlappingPositions) {
            return next(new GenericError("Some of the positions are overlapping"));
        }

        try {
            await Channel.bulkWrite(updatedChannelDocuments.map((channel) => {
                return {
                    updateOne: {
                        filter: {
                            _id: channel.id
                        },
                        update: channel.toObject()
                    }
                };
            }));

            await server.mendChannelPositions({
                channel_type: affectedChannels[0].type === ChannelTypes.SERVER_CATEGORY ? "category" : "channel",
                parent_id: affectedChannels[0].parent,
                save: true
            });
        } catch (error) {
            return next(error);
        }

        const refreshedChannels = await Channel.find({ server: server.id });

        const updatedChannels = refreshedChannels.filter((updatedChannel) => affectedChannels.findIndex((selectedChannel) => {
            return updatedChannel.id === selectedChannel.id;
        }) !== -1);

        return res.send({ channels: updatedChannels });
    }
}

export default ServerChannelsController;