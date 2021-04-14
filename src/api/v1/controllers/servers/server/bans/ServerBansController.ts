import { Response, Request, NextFunction } from "express";
import BaseController from "../../../BaseController";
import Ban from "../../../../../../models/ban";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../../errors/GenericError";
import Member from "../../../../../../models/member";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";

class ServerBansController extends BaseController {
    public static async getBans(req: Request, res: Response): ControllerReturnPromise {
        const bans = await Ban.find({ server: req.bus.server.id });

        return res.send({ bans });
    }

    public static async getBan(req: Request, res: Response): ControllerReturnPromise {
        const ban = req.bus.ban;

        return res.send({ ban });
    }

    public static async createBan(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const moderator = req.user;

        const user = req.bus.user;
        const server = req.bus.server;

        if (user.id === server.owner) {
            return next(new GenericError("The owner of a server cannot be banned").setHttpStatusCode(HttpStatusCode.FORBIDDEN));
        }

        if (user.id === moderator.id) {
            return next(new GenericError("You cannot ban yourself").setHttpStatusCode(HttpStatusCode.FORBIDDEN));
        }

        const existingBan = await Ban.exists({ user: user.id, server: server.id });

        if (existingBan) {
            return next(new GenericError("This user is already banned").setHttpStatusCode(HttpStatusCode.CONFLICT));
        }

        const ban = new Ban({
            user: user.id,
            server: server.id,
            moderator: moderator.id,
            reason: req.body.reason
        });

        const member = await Member.findOne({ server: server.id, user: user.id });

        try {
            await ban.save();

            if (member) {
                await member.remove();
            }
        } catch (error) {
            return next(error);
        }

        return res.status(HttpStatusCode.CREATED).send({ ban });
    }

    public static async deleteBan(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const ban = req.bus.ban;

        try {
            await ban.remove();
        } catch (error) {
            return next(error);
        }

        return res.send({ ban });
    }
}

export default ServerBansController;