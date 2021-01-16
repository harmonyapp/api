import { Response, Request, NextFunction } from "express";
import BaseController from "../BaseController";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Channel from "../../../../models/channel";
import GenericError from "../../../../errors/GenericError";
import ErrorMessages from "../../../../errors/Messages";
import { ControllerReturnPromise } from "../../../../interfaces/ControllerReturn";

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

    public static async deleteChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;
        const channel = req.bus.channel;

        try {
            await channel.remove();
        } catch (error) {
            return next(error);
        }

        return res.send({ channel });
    }
}

export default ChannelsController;