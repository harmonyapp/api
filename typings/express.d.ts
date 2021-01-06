import { Server } from "socket.io";
import { IApplicationDocument } from "../src/models/application";
import { IChannelDocument } from "../src/models/channel";
import { IMemberDocument } from "../src/models/member";
import { IServerDocument } from "../src/models/server";
import { ISessionDocument } from "../src/models/session";
import { IUserDocument } from "../src/models/user";

declare global {
    namespace Express {
        interface Request {
            session?: ISessionDocument | IApplicationDocument;
            user?: IUserDocument;
            bus: {
                user?: IUserDocument;
                server?: IServerDocument;
                channel?: IChannelDocument;
                member?: IMemberDocument;
            }
            io: Server;
        }
    }
}