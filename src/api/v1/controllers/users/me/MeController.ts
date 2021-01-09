import { Response, Request } from "express";
import BaseController from "../../BaseController";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";

class MeController extends BaseController {
    public static async getUser(req: Request, res: Response): ControllerReturnPromise {
        const user = req.user;

        res.send({ user: user.toJSON({ isPublic: true }) });
    }
}

export default MeController;