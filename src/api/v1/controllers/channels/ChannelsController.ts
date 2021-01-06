import config from "../../../../../config/config";
import { Response, Request, NextFunction } from "express";
import BaseController from "../BaseController";
import Server from "../../../../models/server";
import Member from "../../../../models/member";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Channel from "../../../../models/channel";
import GenericError from "../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../interfaces/ControllerReturn";
import ErrorMessages from "../../../../errors/Messages";

class ChannelsController extends BaseController {
    public static async getChannels(req: Request, res: Response): ControllerReturnPromise {
        const channels = await Channel.find({ server: req.bus.server.id }).sort("position");

        return res.send({ channels });
    }

    public static async getChannelByID(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = await Channel.findOne({ _id: req.params.channelID, server: req.bus.server.id });

        if (!channel) {
            return next(new GenericError("Channel not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
        }

        return res.send({ channel });
    }

    public static async deleteChannel(req: Request, res: Response, next: NextFunction) {
        const server = req.bus.server;
        const channel = req.bus.channel;

        if (server.owner !== req.user.id) {
            return next(new GenericError(ErrorMessages.MISSING_PERMISSIONS).setHttpStatusCode(HttpStatusCode.FORBIDDEN));
        }

        try {
            await channel.remove();
        } catch (error) {
            return next(error);
        }

        return res.send({ channel })
    }
}

export default ChannelsController;