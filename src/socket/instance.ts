import { createAdapter } from "socket.io-redis";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import socketEvents from "./events";
import { createRedisClient, registerRedisClient } from "../redis/instance";

let IO_INSTANCE: SocketServer | undefined = undefined;

export function initialize(server: HttpServer): void {
    IO_INSTANCE = new SocketServer(server, { cors: { origin: "*" } });

    const pubClient = createRedisClient({ url: process.env.REDIS_URI, prefix: "socketio" });
    const subClient = pubClient.duplicate();

    registerRedisClient(subClient);

    IO_INSTANCE.adapter(createAdapter({ pubClient, subClient }));

    socketEvents(IO_INSTANCE);
}

export function getIOInstance(): SocketServer {
    return IO_INSTANCE;
}