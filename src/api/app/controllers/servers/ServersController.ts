import config from "../../../../../config/config";
import { Response, Request, NextFunction } from "express";
import BaseController from "../BaseController";
import Server from "../../../../models/server";
import Member from "../../../../models/member";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../interfaces/ControllerReturn";

class ServersController extends BaseController {
    public static async getServers(req: Request, res: Response): ControllerReturnPromise {
        const members = await Member.find({ user: req.user.id }).populate("server").exec();

        return res.send({ servers: members.map((member) => member.server) });
    }

    public static async getServerByID(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = await Server.findOne({ _id: req.params.id, owner: req.user.id });

        if (!server) {
            return next(new GenericError("Server not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
        }

        return res.send({ server });
    }

    public static async createServer(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const existingServers = await Server.countDocuments({ owner: req.user.id });
        const maxServers = config.get("maxServers");

        if (existingServers >= maxServers) {
            return next(
                new GenericError("You can't be in more than " + maxServers + " servers at the same time")
                    .setHttpStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY)
            );
        }

        const { name } = req.body;

        const serverObject = {
            name: name,
            owner: req.user.id
        };

        const server = new Server(serverObject);

        try {
            await server.save();
        } catch (error) {
            return next(error);
        }

        const member = new Member({
            server: server.id,
            user: req.user.id
        });

        try {
            await member.save();
        } catch (error) {
            return next(error);
        }

        return res.status(HttpStatusCode.CREATED).send({ server });
    }
}

export default ServersController;