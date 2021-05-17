import { Server as SocketServer } from "socket.io";
import SocketExtended from "../interfaces/Socket";
import authenticate from "../api/v1/middlewares/authenticate";
import Member from "../models/member";
import { SocketEvents } from "../util/Constants";
import Channel from "../models/channel";
import Role from "../models/role";

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
        const channels = await Channel.find({ server: { $in: members.map((member) => member.server) } });
        const roles = await Role.find({ server: { $in: members.map((member) => member.server) } });

        const data = {
            user: user,
            servers: members.map((member) => member.server),
            channels: channels,
            roles: roles
        };

        socket.emit(SocketEvents.READY, data);
    });
};

export default socketEvents;