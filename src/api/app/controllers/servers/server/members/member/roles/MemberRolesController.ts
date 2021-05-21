import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../../../../../interfaces/ControllerReturn";
import Member from "../../../../../../../../models/member";
import Role from "../../../../../../../../models/role";
import PositionUtil from "../../../../../../../../util/PositionUtil";
import BaseController from "../../../../../BaseController";

class MemberRolesController extends BaseController {
    public static async modifyRole(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;
        const member = req.bus.server_member;
        const targetMember = req.bus.member;
        const role = req.bus.role;

        if (role.id === server.id) {
            return next(new GenericError("You cannot assign/remove the default role from someone"));
        }

        const memberRoles = await Role.find({ _id: { $in: member.roles } });

        PositionUtil.sortByPosition(memberRoles);

        if (role.position > memberRoles[memberRoles.length - 1].position && member.user !== server.owner) {
            return next(new GenericError("You can't modify someone's role higher than your own highest role"));
        }

        if (req.method === "PUT") {
            if (targetMember.roles.indexOf(role.id) !== -1) {
                return next(new GenericError("That role already exists on the specified member"));
            }

            targetMember.roles.push(role.id);
        } else if (req.method === "DELETE") {
            const roleIndex = targetMember.roles.indexOf(role.id);

            if (roleIndex === -1) {
                return next(new GenericError("That role does not exist on the specified member"));
            }

            targetMember.roles.splice(roleIndex, 1);
        }

        try {
            await targetMember.save();
        } catch (error) {
            return next(error);
        }

        const updatedMember = await Member.findOne({ _id: targetMember.id });

        return res.send({ member: updatedMember });
    }
}

export default MemberRolesController;