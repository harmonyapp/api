import { Response, Request, NextFunction } from "express";
import BaseController from "../../BaseController";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";

class DMChannelController extends BaseController {
    public static async getChannel(req: Request, res: Response): ControllerReturnPromise {
        const channel = req.bus.channel;

        return res.send({ channel });
    }

    public static async deleteChannel(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const channel = req.bus.channel;

        try {
            // close...
        } catch (error) {
            return next(error);
        }

        return res.send({ channel });
    }
}

export default DMChannelController;