import { Response, Request, NextFunction } from "express";
import { matchedData } from "express-validator";
import BaseController from "../../../BaseController";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import ErrorMessages from "../../../../../../errors/Messages";
import Channel, { IChannelDocument } from "../../../../../../models/channel";
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
        const channelData: { id: string; position?: number; parent?: string | null; }[] = req.body;
        const server = req.bus.server;

        const channelIDsArray = channelData.map((channel) => channel.id);
        const duplicateIDs = channelIDsArray.some((id, index) => channelIDsArray.indexOf(id) !== index);

        if (duplicateIDs) {
            return next(new GenericError("Duplicate ID's found"));
        }

        if (!Array.isArray(channelData)) {
            return next(new GenericError("This endpoint expects an array"));
        }

        const serverChannels = await Channel.find({ server: server.id });

        for (const channel of channelData) {
            if (!channel.id) {
                return next(new FieldError("id", "This field is required"));
            }

            if (channel.position && !isNumeric(channel.position)) {
                return next(new FieldError("position", "This field expects a number"));
            }

            if (Object.prototype.hasOwnProperty.call(channel, "parent")) {
                if (channel.parent !== null) {
                    const parentChannel = serverChannels.find((ch) => ch.id === channel.parent);

                    if (!parentChannel) {
                        return next(new FieldError("parent", "Parent channel not found"));
                    }

                    if (parentChannel.type !== ChannelTypes.SERVER_CATEGORY) {
                        return next(new FieldError("parent", "Parent channel must be a category"));
                    }
                }
            }
        }

        const affectedChannels = serverChannels.filter((channel) => {
            return channelData.findIndex((data) => {
                return data.id === channel.id;
            }) !== -1;
        });

        if (affectedChannels.length !== channelData.length) {
            return next(new GenericError("One or more of the provided channel ID's are not valid"));
        }

        if (!affectedChannels.every((channel) => channel.isSwappableWith(affectedChannels[0].type))) {
            return next(new GenericError("You can't mix category channels with text/voice channels"));
        }

        // If the user provides a parent channel but not a position, we will assign the lowest position (highest number).
        // The first time we set the position of a channel that wasn't given one, we use the channel count to calculate the position.
        // Since we don't save each channel when we set it's position, the channel count will remain the same throughout the execution of this function.
        // So for the rest of the channels, if any, we increment the parentPositions[id], and use it to calculate the new position of the next channel
        const parentPositions: Record<string, number> = {};

        const missingPosition = channelData.filter((channel) => {
            return Object.prototype.hasOwnProperty.call(channel, "parent") && !Object.prototype.hasOwnProperty.call(channel, "position");
        });

        for (const channel of missingPosition) {
            const parent = channel.parent;
            const parentPosition = parentPositions[parent];

            const childrenChannelsCount = serverChannels.filter(
                (channel) => (channel.parent || null) === parent && channel.type !== ChannelTypes.SERVER_CATEGORY
            ).length;

            if (!parentPosition) {
                parentPositions[parent] = 1;

                channel.position = childrenChannelsCount;
            } else {
                channel.position = childrenChannelsCount + parentPositions[parent];

                parentPositions[parent]++;
            }
        }

        const updatedChannelDocuments = affectedChannels.map((serverChannel) => {
            const updatedChannelData = channelData.find((channel) => channel.id === serverChannel.id);

            if (updatedChannelData) {
                if (Object.prototype.hasOwnProperty.call(updatedChannelData, "position")) {
                    serverChannel.position = updatedChannelData.position;
                }

                if (Object.prototype.hasOwnProperty.call(updatedChannelData, "parent")) {
                    serverChannel.parent = updatedChannelData.parent;
                }
            }

            return serverChannel;
        });

        const parentToChannels = serverChannels.reduce((accumulator, channel) => {
            const parent = channel.parent || (channel.type === 3 && "category") || "orphan";

            if (!accumulator[parent]) { accumulator[parent] = []; }

            accumulator[parent].push(channel);

            return accumulator;
        }, {} as Record<string, IChannelDocument[]>);

        for (const parent of Object.keys(parentToChannels)) {
            const positionArray = parentToChannels[parent].map((channel) => channel.position);

            const overlappingPositions = positionArray.some((position, index) => {
                return positionArray.indexOf(position, index + 1) !== -1;
            });

            if (overlappingPositions) {
                return next(new GenericError("Some of the positions are overlapping"));
            }
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