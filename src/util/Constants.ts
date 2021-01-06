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
    READY: "ready",
    SERVER_CREATE: "server_create",
};

export const UserFlags = {
    DEVELOPER: 0x1
};