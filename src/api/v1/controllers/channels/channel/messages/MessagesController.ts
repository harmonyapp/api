import { Response, Request, NextFunction } from "express";
import BaseController from "../../../BaseController";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";
import FieldError from "../../../../../../errors/FieldError";
import Message, { IMessageDocument } from "../../../../../../models/message";
import isNumeric from "../../../../../../helpers/isNumeric";

class MessagesController extends BaseController {
    public static async getMessages(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = req.bus.channel;

        if (req.query.before && req.query.after) {
            return next(new GenericError("\"before\" and \"after\" have to be passed exclusively"));
        }

        let queryMessage: IMessageDocument;

        if (req.query.before || req.query.after) {
            const queryMessageID = req.query.before ? req.query.before : req.query.after;

            queryMessage = await Message.findOne({ _id: queryMessageID }).raw();

            if (!queryMessage) {
                return next(new GenericError("Message with specified ID not found"));
            }
        }

        if (typeof req.query.limit !== "string" || !isNumeric(req.query.limit)) {
            return next(new FieldError("limit", "This field expects a number"));
        }

        const limit = Number(req.query.limit);

        if (limit < 1 || limit > 100) {
            return next(new FieldError("limit", "Limit must be between 1 and 100"));
        }

        if (req.query.before) {
            const beforeMessage = await Message.findOne({ _id: req.query.before });

            const messages = await Message.find({ channel: channel.id, createdAt: { $lt: beforeMessage.createdAt } }).sort("-createdAt").limit(limit);

            return res.send({
                messages
            });
        } else if (req.query.after) {
            const afterMessage = await Message.findOne({ _id: req.query.after });

            const messages = await Message.find({ channel: channel.id, createdAt: { $gt: afterMessage.createdAt } }).sort("-createdAt").limit(limit);

            return res.send({
                messages
            });
        } else {
            const messages = await Message.find({ channel: channel.id }).sort("-createdAt").limit(limit);

            return res.send({
                messages
            });
        }
    }

    public static async getMessageByID(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const message = await Message.findOne({ _id: req.params.id, owner: req.user.id });

        if (!message) {
            return next(new GenericError("Message not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
        }

        return res.send({ message });
    }

    public static async createMessage(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const { content } = req.body;

        const message = new Message({
            content: content,
            author: req.user.id,
            channel: req.bus.channel.id,
            server: req.bus.channel.server
        });

        try {
            await message.save();
        } catch (error) {
            return next(error);
        }

        return res.send({ message });
    }
}

export default MessagesController;