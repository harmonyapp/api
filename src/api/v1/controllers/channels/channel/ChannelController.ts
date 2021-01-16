import { Response, Request, NextFunction } from "express";
import { matchedData } from "express-validator";
import BaseController from "../../BaseController";
import Server from "../../../../../models/server";
import GenericError from "../../../../../errors/GenericError";
import ErrorMessages from "../../../../../errors/Messages";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";
import Invite from "../../../../../models/invite";
import HttpStatusCode from "../../../../../interfaces/HttpStatusCode";

class ChannelController extends BaseController {
    public static async getChannel(req: Request, res: Response): ControllerReturnPromise {
        const channel = req.bus.channel;

        return res.send({ channel });
    }

    public static async updateChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = req.bus.channel;
        const channelData = matchedData(req);

        Object.assign(channel, channelData);

        try {
            await channel.save();
        } catch (error) {
            return next(error);
        }

        return res.send({ channel });
    }

    public static async deleteChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = req.bus.channel;
        const server = await Server.findOne({ id: channel.server });

        try {
            await channel.remove();
        } catch (error) {
            return next(error);
        }

        res.send({ channel });
    }

    public static async createInvite(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = req.bus.channel;

        const invite = new Invite({
            server: channel.server,
            channel: channel.id,
            user: req.user.id
        });

        try {
            await invite.save();
        } catch (error) {
            return next(error);
        }

        return res.status(HttpStatusCode.CREATED).send({ invite });
    }
}

export default ChannelController;