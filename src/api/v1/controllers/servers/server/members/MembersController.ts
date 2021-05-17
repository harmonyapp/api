import { NextFunction, Request, Response } from "express";
import FieldError from "../../../../../../errors/FieldError";
import GenericError from "../../../../../../errors/GenericError";
import isNumeric from "../../../../../../helpers/isNumeric";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";
import Member, { IMemberDocument } from "../../../../../../models/member";
import { IUserDocument } from "../../../../../../models/user";
import BaseController from "../../../BaseController";

class MembersController extends BaseController {
    public static async getMembers(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const limit = +(req.query.limit || 250);
        const after = req.query.after;

        const sortMembers = (members: IMemberDocument[]) => {
            return members.sort((a, b) => {
                const userA = a.user as unknown as IUserDocument;
                const userB = b.user as unknown as IUserDocument;

                return (userA.username > userB.username) ? 1 : ((userB.username > userA.username) ? -1 : 0);
            });
        };

        if (limit) {
            if (!isNumeric(limit)) {
                return next(new FieldError("limit", "This field expects a number"));
            }

            if (limit < 1 || limit > 1000) {
                return next(new FieldError("limit", "Limit must be between 1 and 1000"));
            }
        }

        let members = await Member.find({ server: req.bus.server.id }).sort("-createdAt").populate("user");

        sortMembers(members);

        if (after) {
            const userIndex = members.findIndex((member) => {
                const user = member.user as unknown as IUserDocument;

                return user.id === after;
            });

            if (userIndex === -1) {
                return next(new GenericError("User with specified ID not found"));
            }

            members = members.slice(userIndex + 1, userIndex + limit);
        } else {
            members = members.slice(0, limit);
        }

        return res.send({ members });
    }
}

export default MembersController;