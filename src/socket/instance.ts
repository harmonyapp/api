import { createAdapter } from "socket.io-redis";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { RedisClient } from "redis";
import socketEvents from "./events";

let IO_INSTANCE: SocketServer | undefined = undefined;

export function initialize(server: HttpServer): void {
    IO_INSTANCE = new SocketServer(server);

    const pubClient = new RedisClient({ url: process.env.REDIS_URI, prefix: "socketio" });
    const subClient = pubClient.duplicate();

    IO_INSTANCE.adapter(createAdapter({ pubClient, subClient }));

    socketEvents(IO_INSTANCE);
}

export function getIOInstance(): SocketServer {
    return IO_INSTANCE;
}