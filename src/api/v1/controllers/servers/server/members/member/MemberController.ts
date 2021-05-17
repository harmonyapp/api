import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../../../../interfaces/ControllerReturn";
import Role from "../../../../../../../models/role";
import PositionUtil from "../../../../../../../util/PositionUtil";
import BaseController from "../../../../BaseController";

class MemberController extends BaseController {
    public static async getMember(req: Request, res: Response): ControllerReturnPromise {
        const member = req.bus.member;

        return res.send({ member });
    }

    public static async updateMember(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const member = req.bus.member;
        const server = req.bus.server;
        const targetMember = req.bus.server_member;

        const nickname: string = req.body.nickname?.trim();
        const role_ids: string[] = req.body.roles;

        if (role_ids) {
            if (!member.hasPermission("MANAGE_ROLES")) {
                return next(new GenericError("You don't have permission to change this person's roles"));
            }

            const memberRoles = await Role.find({ _id: { $in: member.roles } });
            const targetRoles = await Role.find({ _id: { $in: role_ids }, server: server.id });

            if (targetRoles.length < role_ids.length) {
                return next(new GenericError("Some of the provided role ID's are invalid"));
            }

            PositionUtil.sortByPosition(memberRoles);
            PositionUtil.sortByPosition(targetRoles);

            const highestMemberRole = memberRoles[memberRoles.length - 1];
            const highestTargetRole = targetRoles[targetRoles.length - 1];

            if (highestTargetRole.position > highestMemberRole.position) {
                return next(new GenericError("You can't assign someone a role higher than your own highest role"));
            }

            targetMember.roles = targetRoles.map((role) => role.id);
        }

        if (nickname) {
            if (!member.hasPermission("MANAGE_NICKNAMES")) {
                return next(new GenericError("You don't have permission to change this person's nickname"));
            }

            targetMember.nickname = nickname;
        }

        await targetMember.save();

        return res.send({ member: targetMember });
    }
}

export default MemberController;