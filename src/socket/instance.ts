import { createAdapter } from "socket.io-redis";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { RedisClient } from "redis";
import socketEvents from "./events";

let IO_INSTANCE: SocketServer | undefined = undefined;

export function initialize(server: HttpServer) {
    IO_INSTANCE = new SocketServer(server);

    const pubClient = new RedisClient({ host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT });
    const subClient = pubClient.duplicate();

    IO_INSTANCE.adapter(createAdapter({ pubClient, subClient }));

    socketEvents(IO_INSTANCE);
}

export function getIOInstance(): SocketServer {
    return IO_INSTANCE;
}