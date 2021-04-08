import path from "path";
import PermissionString from "../interfaces/PermissionString";

export const Scopes = [
    "account.read", "account.update",
    "servers.read"
] as const;

export const UsernameRegex = /^[A-Za-z0-9_\-.]+$/;

export const ProjectRoot = path.join(process.cwd(), "/src");

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
    SEND_MESSAGES: 0x000001,
    VIEW_CHANNEL: 0x000002
} as { [key in PermissionString]: number; };

export const SocketEvents = {
    READY: "READY",
    SERVER_CREATE: "SERVER_CREATE",
};

export const UserFlags = {
    DEVELOPER: 0x1
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