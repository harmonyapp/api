import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Member from "../../../../models/member";

const findMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userID = req.params.userID;
    const member = await Member.findOne({ user: userID, server: req.bus.server.id });

    if (!member) {
        return next(new GenericError("Member not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    req.bus.member = member;

    next();
};

export default findMember;