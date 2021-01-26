import { Server as SocketServer } from "socket.io";
import SocketExtended from "../interfaces/Socket";
import authenticate from "../api/v1/middlewares/authenticate";
import Member from "../models/member";
import { SocketEvents } from "../util/Constants";

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

const socketEvents = (io: SocketServer): void => {
    // Since the auth object is only available on the handshake object, we have to extract it and set it as a header on the request object,
    // so that the middleware is able to read it
    io.use((socket, next) => {
        const token = (socket.handshake.auth as Record<string, string>)?.token;

        socket.request.headers["authorization"] = token;

        next();
    });

    io.use(wrap(authenticate({ required: true, allowApplications: false })));

    io.on("connection", async (socket: SocketExtended) => {
        const user = socket.request.user;
        const members = await Member.find({ user: user.id }).populate("server").exec();

        const data = {
            user: user.toJSON({ isPublic: false }),
            servers: members.map((member) => member.server)
        };

        socket.emit(SocketEvents.READY, data);
    });
};

export default socketEvents;