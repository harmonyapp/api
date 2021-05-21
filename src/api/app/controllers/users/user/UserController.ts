import { Response, Request } from "express";
import BaseController from "../../BaseController";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";

class UserController extends BaseController {
    public static async getUser(req: Request, res: Response): ControllerReturnPromise {
        const user = req.user;

        res.send({ user: user });
    }

    // public static async getUserByID(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
    //     const user = await User.findOne({ id: req.params.id });

    //     if (!user) {
    //         return next(new GenericError("User not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    //     }

    //     return res.send({ user: user.toJSON({ isPublic: true }) });
    // }
}

export default UserController;