import { Response, Request, NextFunction } from "express";
import BaseController from "../../BaseController";
import HttpStatusCode from "../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../errors/GenericError";
import ErrorMessages from "../../../../../errors/Messages";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";
import { matchedData } from "express-validator";
import Channel from "../../../../../models/channel";
import FieldError from "../../../../../errors/FieldError";
import { ChannelTypes } from "../../../../../util/Constants";

class ServerController extends BaseController {
    public static async getServer(req: Request, res: Response): ControllerReturnPromise {
        return res.send({ server: req.bus.server });
    }

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

        try {
            await channel.save();
        } catch (error) {
            return next(error);
        }

        await server.mendChannelPositions({ type: channel.type as 1 | 2 | 3, parent_id: channel.parent, save: true });

        const updatedChannel = await Channel.findOne({ _id: channel.id });

        return res.status(HttpStatusCode.CREATED).send({ channel: updatedChannel });
    }

    public static async updateServer(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;

        const serverData = matchedData(req);

        Object.assign(server, serverData);

        try {
            await server.save();

            return res.status(HttpStatusCode.OK).send({ server });
        } catch (error) {
            return next(error);
        }
    }

    public static async deleteServer(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;

        if (server.owner !== req.user.id) {
            return next(new GenericError(ErrorMessages.MISSING_PERMISSIONS).setHttpStatusCode(HttpStatusCode.FORBIDDEN));
        }

        try {
            await server.remove();

            return res.send({
                success: true,
                message: "Server has been deleted"
            });
        } catch (error) {
            return next(error);
        }
    }
}

export default ServerController;