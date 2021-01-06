import { IncomingMessage } from "http";
import { Socket } from "socket.io";
import { ISessionDocument } from "../models/session";
import { IUserDocument } from "../models/user";

interface Request extends IncomingMessage {
    session?: ISessionDocument;
    user?: IUserDocument;
}

interface SocketExtended extends Socket {
    request: Request;
}

export default SocketExtended;