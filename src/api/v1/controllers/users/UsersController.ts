import { Response, Request } from "express";
import BaseController from "../BaseController";
import { ControllerReturnPromise } from "../../../../interfaces/ControllerReturn";

class UsersController extends BaseController {
    public static async getAuthenticatedUser(req: Request, res: Response): ControllerReturnPromise {
        const user = req.user;

        res.send({ user: user.toJSON({ isPublic: false }) });
    }
}

export default UsersController;