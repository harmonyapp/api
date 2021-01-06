import config from "../../../../../config/config";
import { Response, Request, NextFunction } from "express";
import BaseController from "../BaseController";
import Server from "../../../../models/server";
import Member from "../../../../models/member";
import User from "../../../../models/user";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../interfaces/ControllerReturn";

class UsersController extends BaseController {
    public static async getAuthenticatedUser(req: Request, res: Response): ControllerReturnPromise {
        const user = req.user;

        res.send({ user: user.toJSON({ isPublic: false }) });
    }
}

export default UsersController;