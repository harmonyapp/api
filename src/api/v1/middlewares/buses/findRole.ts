import { NextFunction, Request, Response } from "express";
import GenericError from "../../../../errors/GenericError";
import HttpStatusCode from "../../../../interfaces/HttpStatusCode";
import Role from "../../../../models/role";

const findRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const server = req.bus.server;
    const roleID = req.params.roleID;
    const role = await Role.findOne({ _id: roleID, server: server.id });

    if (!role) {
        return next(new GenericError("Role not found").setHttpStatusCode(HttpStatusCode.NOT_FOUND));
    }

    req.bus.role = role;

    next();
};

export default findRole;