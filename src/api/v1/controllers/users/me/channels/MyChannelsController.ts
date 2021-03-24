import { Response, Request, NextFunction } from "express";
import BaseController from "../../../BaseController";
import User from "../../../../../../models/user";
import Relationship from "../../../../../../models/relationship";
import FieldError from "../../../../../../errors/FieldError";
import Channel from "../../../../../../models/channel";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";
import { ChannelTypes, RelationshipTypes } from "../../../../../../util/Constants";
import GenericError from "../../../../../../errors/GenericError";

class MyChannelsController extends BaseController {
    public static async getChannels(req: Request, res: Response): ControllerReturnPromise {
        const channels = await Channel.find({ recipients: req.user.id, visible_to: req.user.id });

        return res.send({ channels });
    }

    public static async createDMChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const recipient = req.bus.user;

        if (recipient.id === req.user.id) {
            return next(new GenericError("You cannot create a DM chat with yourself"));
        }

        const existingChannel = await Channel.findOne({ type: ChannelTypes.DM, recipients: { $size: 2, $all: [req.user.id, recipient.id] } });

        // If they closed the channel and want to reopen it
        if (existingChannel && existingChannel.visible_to.indexOf(req.user.id) === -1) {
            existingChannel.visible_to.push(req.user.id);

            await existingChannel.save();

            return res.status(HttpStatusCode.CREATED).send({ channel: existingChannel });
        }

        if (existingChannel) {
            return res.send({ channel: existingChannel });
        }

        // You can reopen a closed channel with a user who has blocked you, but you cannot open a new one.
        // This is because, when you open a new channel, it opens for both. But if it already exists,
        // opening it on one end does not affect the other user.

        const relationship = await Relationship.findOne({ user: req.user.id, concerning: recipient.id });

        if (relationship && relationship.type === RelationshipTypes.BLOCK) {
            return next(new FieldError("recipient", "This user does not exist"));
        }

        const channel = new Channel({
            type: ChannelTypes.DM,
            recipients: [req.user.id, recipient.id],
            visible_to: [req.user.id, recipient.id]
        });

        try {
            await channel.save();
        } catch (error) {
            return next(error);
        }

        return res.status(HttpStatusCode.CREATED).send({ channel });
    }

    public static async createGroupDMChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const recipient_ids: string[] = Array.from(new Set(req.body.recipients));

        const recipientUsers = await User.find({ _id: { $in: recipient_ids } });

        const unknownRecipients = recipient_ids.length !== recipientUsers.length ?
            recipient_ids.filter((id) => recipientUsers.findIndex((user) => user.id === id) === -1) :
            [];

        if (unknownRecipients.length) {
            return next(new FieldError("recipients", "One or more of the provided ID's are invalid"));
        }

        const recipients = Array.from(new Set([
            ...recipient_ids,
            req.user.id
        ]));

        const channel = new Channel({
            recipients: recipients,
            type: ChannelTypes.GROUP_DM,
            visible_to: recipients,
            owner: req.user.id
        });

        try {
            await channel.save();
        } catch (error) {
            return next(error);
        }

        return res.send({ channel });
    }

    // Deleting a channel is the same as closing a channel. Closing the channel does not permanently delete it
    public static async deleteChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = req.bus.channel;

        const index = channel.visible_to.indexOf(req.user.id);

        if (index === -1) {
            return res.send({ channel });
        }

        channel.visible_to.splice(index, 1);

        try {
            await channel.save();
        } catch (error) {
            return next(error);
        }

        return res.status(HttpStatusCode.OK).send({ channel });
    }
}

export default MyChannelsController;