import { Request, Response, NextFunction } from "express";
import Session from "../../../models/session";
import User from "../../../models/user";
import Application from "../../../models/application";
import HttpStatusCode from "../../../interfaces/HttpStatusCode";
import debug from "../../../helpers/debug";
import GenericError from "../../../errors/GenericError";
import { Scope } from "../../../interfaces/Scope";

type AuthenticateFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const authenticate = ({ scopes = [], required = false, allowApplications = true }: { scopes?: Scope[], required?: boolean, allowApplications?: boolean } = {}): AuthenticateFunction => {
    return async function (req: Request, res: Response, next: NextFunction) {
        if (!allowApplications && scopes.length) {
            console.warn("Scopes will be ignored if `allowApplications` is set to false");
        }

        try {
            const header = req.headers.authorization?.trim();

            if (!header) throw new Error("No header");

            const type = header.startsWith("Bearer ") && "bearer" || header.startsWith("Bot ") && "bot" || false;

            if (!type) throw new Error("Invalid type");

            const token = header.replace(/^Bot |^Bearer /, "");

            if (type === "bearer") {
                const session = await Session.findOne({ token });

                if (!session) {
                    throw new Error("No session");
                }

                const user = await User.findOne({ _id: session.user });

                if (!user) {
                    throw new Error("No user");
                }

                req.session = session;
                req.user = user;

                return next();
            } else if (type === "bot") {
                if (!allowApplications) return next(
                    new GenericError("This resource cannot be accessed by an application")
                        .setHttpStatusCode(HttpStatusCode.FORBIDDEN)
                );

                const application = await Application.findOne({ token });

                if (!application) throw new Error("No application");

                const user = await User.findOne({ _id: application.user });

                if (!scopes || !scopes.length || application.isWithinScope(scopes)) {
                    req.session = application;
                    req.user = user;

                    return next();
                }

                return next(
                    new GenericError(`This application does not have the required scopes: "${scopes.join(", ")}"`)
                        .setHttpStatusCode(HttpStatusCode.FORBIDDEN)
                );
            } else { // Redundant
                return next(
                    new GenericError("Invalid authentication type").setHttpStatusCode(HttpStatusCode.BAD_REQUEST)
                );
            }
        } catch (error) {
            debug("Auth error", error);

            if (required) {
                return next(
                    new GenericError("Unauthenticated").setHttpStatusCode(HttpStatusCode.UNAUTHORIZED)
                );
            }

            return next();
        }
    };
};

export default authenticate;