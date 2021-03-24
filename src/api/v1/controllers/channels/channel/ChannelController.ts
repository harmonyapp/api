import { Response, Request, NextFunction } from "express";
import { matchedData } from "express-validator";
import BaseController from "../../BaseController";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";
import Invite from "../../../../../models/invite";
import HttpStatusCode from "../../../../../interfaces/HttpStatusCode";
import Server from "../../../../../models/server";

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

        const server = await Server.findOne({ _id: channel.server });

        try {
            await channel.remove();

            await server.mendChannelPositions({ type: channel.type as 1 | 2 | 3, parent_id: channel.parent, save: true });
        } catch (error) {
            return next(error);
        }

        return res.send({ channel });
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