import { Response, Request, NextFunction } from "express";
import BaseController from "../../BaseController";
import HttpStatusCode from "../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../errors/GenericError";
import ErrorMessages from "../../../../../errors/Messages";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";
import { matchedData } from "express-validator";
import Channel from "../../../../../models/channel";

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

        const existingChannels = await Channel.countDocuments({ server: req.bus.server.id });
        const maxChannels = 200;

        if (existingChannels >= maxChannels) {
            return next(
                new GenericError("A single server cannot hold more than " + maxChannels + " channels at a time")
                    .setHttpStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY)
            );
        }

        const { name } = req.body;

        const channelObject = {
            name: name,
            server: server.id,
            owner: req.user.id
        };

        const channel = new Channel(channelObject);

        try {
            await channel.save();
        } catch (error) {
            return next(error);
        }

        return res.status(HttpStatusCode.CREATED).send({ channel });
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
        const member = req.bus.member;

        if (server.owner !== req.user.id) {
            return next(new GenericError(ErrorMessages.MISSING_PERMISSIONS).setHttpStatusCode(HttpStatusCode.FORBIDDEN));
        }

        try {
            await server.remove();
            await member.remove();

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