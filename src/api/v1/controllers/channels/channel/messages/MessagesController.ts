import config from "../../../../../../../config/config";
import { Response, Request, NextFunction } from "express";
import BaseController from "../../../BaseController";
import Server from "../../../../../../models/server";
import Member from "../../../../../../models/member";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";
import FieldError from "../../../../../../errors/FieldError";
import Message, { IMessageDocument } from "../../../../../../models/message";

class MessagesController extends BaseController {
    public static async getMessages(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = req.bus.channel;

        if (req.query.before && req.query.after) {
            const fieldErrors = new FieldError();

            fieldErrors.addError("before", "This cannot be combined with \"after\"");
            fieldErrors.addError("after", "This cannot be combined with \"before\"");

            return next(fieldErrors);
        }

        let queryMessage: IMessageDocument;

        if (req.query.before || req.query.after) {
            const queryMessageID = req.query.before ? req.query.before : req.query.after;

            queryMessage = await Message.findOne({ id: queryMessageID });

            if (!queryMessage) {
                return next(new GenericError("Message with specified ID not found"));
            }
        }

        if (typeof req.query.limit !== "string" || Number.isNaN(Number(req.query.limit))) {
            return next(new FieldError("limit", "This field expects a number"));
        }

        const limit = Number(req.query.limit);

        if (limit < 1 || limit > 100) {
            return next(new FieldError("limit", "Limit must be between 1 and 100"));
        }

        if (req.query.before) {
            const beforeMessage = await Message.findOne({ id: req.query.before });

            if (!beforeMessage) {
                return next(new FieldError("before", "Message not found"));
            }

            const messages = await Message.find({ channel: channel.id, createdAt: { $gte: beforeMessage.createdAt } }).sort("-createdAt").limit(limit);

            return res.send({
                messages
            });
        } else if (req.query.after) {
            const afterMessage = await Message.findOne({ id: req.query.after });

            if (!afterMessage) {
                return next(new FieldError("after", "Message not found"));
            }

            const messages = await Message.find({ channel: channel.id, createdAt: { $lte: afterMessage.createdAt } }).sort("-createdAt").limit(limit);

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
}

export default MessagesController;