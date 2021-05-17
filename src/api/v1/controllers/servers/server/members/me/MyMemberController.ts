import { NextFunction, Request, Response } from "express";
import BaseController from "../../../../BaseController";
import { ControllerReturnPromise } from "../../../../../../../interfaces/ControllerReturn";
import Member from "../../../../../../../models/member";

class MyMemberController extends BaseController {
    public static async getMember(req: Request, res: Response): ControllerReturnPromise {
        const member = req.bus.server_member;

        return res.send({ member });
    }

    public static async updateNickname(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const member = req.bus.server_member;
        const nickname = req.body.nickname;

        member.nickname = nickname;

        try {
            await member.save();
        } catch (error) {
            return next(error);
        }

        const updatedMember = await Member.findOne({ _id: member.id });

        return res.send({ member: updatedMember });
    }
}

export default MyMemberController;