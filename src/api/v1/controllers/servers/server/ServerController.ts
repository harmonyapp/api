import { Response, Request, NextFunction } from "express";
import { matchedData } from "express-validator";
import BaseController from "../../BaseController";
import HttpStatusCode from "../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../errors/GenericError";
import ErrorMessages from "../../../../../errors/Messages";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";

class ServerController extends BaseController {
    public static async getServer(req: Request, res: Response): ControllerReturnPromise {
        return res.send({ server: req.bus.server });
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