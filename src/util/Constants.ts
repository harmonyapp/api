import path from "path";

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

// To be determined

// export const Permissions = {
//     SEND_MESSAGES: 0x000001,
//     VIEW_CHANNEL: 0x000002
// };

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