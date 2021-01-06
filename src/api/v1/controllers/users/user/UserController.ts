import config from "../../../../../../config/config";
import { Response, Request, NextFunction } from "express";
import BaseController from "../../BaseController";
import Server from "../../../../../models/server";
import Member from "../../../../../models/member";
import User from "../../../../../models/user";
import HttpStatusCode from "../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../../interfaces/ControllerReturn";

class UserController extends BaseController {
    public static async getUser(req: Request, res: Response): ControllerReturnPromise {
        const user = req.user;

        res.send({ user: user.toJSON({ isPublic: true }) });
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