import { NextFunction, Response, Request } from "express";
import { matchedData } from "express-validator";
import BaseController from "../BaseController";
import User from "../../../../models/user";
import Session from "../../../../models/session";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../interfaces/ControllerReturn";

class AuthController extends BaseController {
    public static async register(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const userData = matchedData(req);
        const user = new User(userData);

        try {
            await user.save();

            const session = await user.createSession();

            return res.status(201).send({
                token: session.token,
                user: user
            });
        } catch (error) {
            return next(error);
        }
    }

    public static async login(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const user = await User.findByCredentials(req.body.username, req.body.password);

        if (!user) {
            return next(new GenericError("Wrong username or password"));
        }

        const session = await user.createSession();

        return res.send({
            token: session.token,
            user
        });
    }

    public static async logout(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const user = req.user;
        const session = req.session;

        if (req.query.signOutAll) {
            const { ok, n } = await Session.deleteMany({ user: user.id });

            if (ok) {
                return res.send({
                    success: true,
                    message: "Successfully cleared " + n + " sessions"
                });
            } else {
                return next(new GenericError("Something went wrong").setHttpStatusCode(HttpStatusCode.INTERNAL_SERVER_ERROR));
            }
        }

        await session.remove();

        return res.status(HttpStatusCode.NO_CONTENT).send();
    }
}

export default AuthController;