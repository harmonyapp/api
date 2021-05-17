import PermissionString from "../interfaces/PermissionString";

export const Scopes = [
    "account.read", "account.update",
    "servers.read"
] as const;

export const UsernameRegex = /^[A-Za-z0-9_\-.]+$/;

/**
 * 1
 * 2
 * 4
 * 8
 * 10
 * 20
 * 40
 * 80
 */

export const PermissionFlags = {
    ADMINISTRATOR: 0x1,
    VIEW_CHANNEL: 0x2,
    VIEW_MESSAGES: 0x1000,
    CREATE_INVITE: 0x4,
    SEND_MESSAGES: 0x8,
    CHANGE_NICKNAME: 0x10,
    MANAGE_SERVER: 0x20,
    MANAGE_ROLES: 0x40,
    MANAGE_MESSAGES: 0x80,
    MANAGE_CHANNELS: 0x100,
    MANAGE_NICKNAMES: 0x200,
    KICK_MEMBERS: 0x400,
    BAN_MEMBERS: 0x800,
    ALL: null
} as { [key in PermissionString]: number; };

PermissionFlags.ALL = Object.values(PermissionFlags).reduce((bits, bit) => {
    if (typeof bit === "number") {
        bits = bits | bit;
    }

    return bits;
}, 0x0);

export const DefaultPermissions = PermissionFlags.VIEW_CHANNEL
    | PermissionFlags.SEND_MESSAGES
    | PermissionFlags.CREATE_INVITE;

export const SocketEvents = {
    READY: "READY" as const,
    SERVER_CREATE: "SERVER_CREATE" as const,
};

export const UserFlags = {
    DEVELOPER: 0x1 as const
};

export const RelationshipTypes = {
    FRIEND: 1 as const,
    BLOCK: 2 as const,
    INCOMING_FRIEND_REQUEST: 3 as const,
    OUTGOING_FRIEND_REQUEST: 4 as const
};

export const ChannelTypes = {
    SERVER_TEXT: 1 as const,
    SERVER_VOICE: 2 as const,
    SERVER_CATEGORY: 3 as const,
    DM: 4 as const,
    GROUP_DM: 5 as const
};

export const ChannelOverwriteTypes = {
    ROLE: 0 as const,
    MEMBER: 1 as const
};