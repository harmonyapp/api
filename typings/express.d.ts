import { Server } from "socket.io";
import { IApplicationDocument } from "../src/models/application";
import { IBanDocument } from "../src/models/ban";
import { IChannelDocument } from "../src/models/channel";
import { IInviteDocument } from "../src/models/invite";
import { IMemberDocument } from "../src/models/member";
import { IRoleDocument } from "../src/models/role";
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
                server_member?: IMemberDocument;
                channel?: IChannelDocument;
                member?: IMemberDocument;
                invite?: IInviteDocument;
                ban?: IBanDocument;
                role?: IRoleDocument;
            };
            io: Server;
        }
    }
}