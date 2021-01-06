import { NextFunction, Request, Response } from "express";
import GenericError from "../../../errors/GenericError";
import HttpStatusCode from "../../../interfaces/HttpStatusCode";
import User from "../../../models/user";

const findUser = async (req: Request, res: Response, next: NextFunction) => {
    const userID = req.params.userID;
    const user = await User.findOne({ _id: userID });

    if (!user) {
        return next(new GenericError("Channel not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    req.bus.user = user;

    next();
}

export default findUser;