import { IChannelDocument } from "../models/channel";
import { IMemberDocument } from "../models/member";
import Role, { IRoleDocument } from "../models/role";
import { IServerDocument } from "../models/server";
import { PermissionFlags } from "./Constants";
import PositionUtil from "./PositionUtil";
import Util from "./Util";

class PermissionUtil extends Util {
    public static async computeBasePermissions(member: IMemberDocument, server: IServerDocument): Promise<number> {
        if (member.user === server.owner) {
            return PermissionFlags.ALL;
        }

        const everyoneRole = await Role.findOne({ _id: server.id });

        let permissions = everyoneRole.permissions;

        await member.populate("roles").execPopulate();

        const roles = member.roles as unknown as IRoleDocument[];

        for (const role of roles) {
            permissions = permissions | role.permissions;
        }

        if ((permissions & PermissionFlags.ADMINISTRATOR) === PermissionFlags.ADMINISTRATOR) {
            return PermissionFlags.ALL;
        }

        member.depopulate("roles");

        return permissions;
    }

    public static async computeOverwrites(basePermissions: number, member: IMemberDocument, channel: IChannelDocument): Promise<number> {
        if ((basePermissions & PermissionFlags.ADMINISTRATOR) === PermissionFlags.ADMINISTRATOR) {
            return PermissionFlags.ALL;
        }

        let permissions = basePermissions;

        const channelOverwrites = channel.permission_overwrites;
        const everyoneOverwrites = channelOverwrites.find((overwrite) => {
            return overwrite.id === member.server;
        });

        if (everyoneOverwrites) {
            permissions = permissions & ~everyoneOverwrites.deny;
            permissions = permissions | everyoneOverwrites.allow;
        }

        await member.populate("roles").execPopulate();

        let allow = 0x0;
        let deny = 0x0;

        const roles = await PositionUtil.sortByPosition(member.roles as unknown as IRoleDocument[]);

        for (const role in roles) {
            const roleOverwrite = channelOverwrites.find((overwrite) => {
                return overwrite.id === role;
            });

            if (roleOverwrite) {
                allow |= roleOverwrite.allow;
                deny |= roleOverwrite.deny;
            }
        }

        permissions = permissions & ~deny;
        permissions = permissions | allow;

        const memberOverwrites = channelOverwrites.find((overwrite) => {
            return overwrite.id === member.id;
        });

        if (memberOverwrites) {
            permissions = permissions & ~everyoneOverwrites.deny;
            permissions = permissions | everyoneOverwrites.allow;
        }

        return permissions;
    }

    public static validatePermissions(permission: number): boolean {
        return permission.toString(2).length <= PermissionFlags.ALL.toString(2).length;
    }
}

export default PermissionUtil;