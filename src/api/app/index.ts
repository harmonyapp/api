import express, { Request, Response, NextFunction } from "express";
import auth from "./routes/auth";
import users from "./routes/users";
import invites from "./routes/invites";
import servers from "./routes/servers";
import channels from "./routes/channels";
import applications from "./routes/applications";
import HttpStatusCode from "../../interfaces/HttpStatusCode";
import debug from "../../helpers/debug";
import BaseError from "../../errors/BaseError";
import GenericError from "../../errors/GenericError";
import { getIOInstance } from "../../socket/instance";
import authenticate from "./middlewares/authenticate";

const app = express();

app.use((req, res, next) => {
    const io = getIOInstance();

    req.io = io;

    // All properties that are set through middlewares, like "findUser" or "findChannel" will live on req.bus, for example: req.bus.user or req.bus.channel
    // The other properties are global, like req.user, which is the user who is logged in, if applicable.
    req.bus = {};

    next();
});

app.use(authenticate({ required: false }));

// Base routes
app.use("/auth", auth);
app.use("/users", users);
app.use("/invites", invites);
app.use("/servers", servers);
app.use("/channels", channels);
app.use("/applications", applications);

app.use((err: BaseError, req: Request, res: Response, next: NextFunction) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    debug("Got error:", err);

    if (!(err instanceof BaseError)) {
        err = new GenericError("Something went wrong.").setHttpStatusCode(HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    const compiled = err.compile();

    const data = Array.isArray(compiled) ? { errors: compiled } : { error: compiled };

    res.status(err.httpStatusCode).send(data);
});

app.use((req, res) => {
    res.status(HttpStatusCode.NOT_FOUND).send();
});

export default app;