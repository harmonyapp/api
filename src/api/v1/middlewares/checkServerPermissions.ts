import { NextFunction, Request, Response } from "express";
import GenericError from "../../../errors/GenericError";
import PermissionString from "../../../interfaces/PermissionString";
import { PermissionFlags } from "../../../util/Constants";

const checkServerPermissions = ({
    flag,
    channelOverwrites = false
}: {
    flag: PermissionString,
    channelOverwrites?: boolean
}): (req: Request, res: Response, next: NextFunction) => Promise<void> => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const server = req.bus.server;
        const member = req.bus.server_member;
        const channel = req.bus.channel;

        let hasPermission = false;

        if (channelOverwrites) {
            hasPermission = await member.hasPermission(flag, { channel, server });
        } else {
            hasPermission = await member.hasPermission(flag, { server });
        }

        const perms = [];

        for (const perm in PermissionFlags) {
            if (await member.hasPermission(perm as PermissionString, { server })) {
                perms.push(perm);
            }
        }

        console.log(`${req.user.username} has following permissions: ${perms.join(", ")}`);

        if (!hasPermission) {
            return next(new GenericError("You don't have permission to perform this action"));
        }

        next();
    };
};

export default checkServerPermissions;