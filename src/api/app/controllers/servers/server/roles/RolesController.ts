import { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import FieldError from "../../../../../../errors/FieldError";
import GenericError from "../../../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import Role from "../../../../../../models/role";
import BaseController from "../../../BaseController";

class RolesController extends BaseController {
    public static async getRoles(req: Request, res: Response): ControllerReturnPromise {
        const server = req.bus.server;

        const roles = await Role.find({ server: server.id });

        return res.send({ roles });
    }

    public static async getRole(req: Request, res: Response): ControllerReturnPromise {
        const role = req.bus.role;

        return res.send({ role });
    }

    public static async createRole(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;

        const { name } = req.body;

        const roles = await Role.find({ server: server.id });

        if (roles.length >= 100) {
            return next(new GenericError("A server cannot have more than 100 roles"));
        }

        const defaultRole = roles.find((role) => {
            return role.id === server.id;
        });

        const role = new Role({
            name: name,
            server: server.id,
            permissions: defaultRole.permissions,
            position: roles.length
        });

        try {
            await role.save();
        } catch (error) {
            return next(error);
        }

        return res.status(HttpStatusCode.CREATED).send({ role });
    }

    public static async updateRole(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;
        const role = req.bus.role;

        const roleData = matchedData(req);

        // Fields that can be edited on the "everyone" role
        const everyoneEditable = ["permissions"];

        if (role.id === server.id) {
            for (const field of Object.keys(roleData)) {
                if (everyoneEditable.indexOf(field) === -1) {
                    return next(new FieldError(field, "This field cannot be changed for the default role"));
                }
            }
        }

        Object.assign(role, roleData);

        try {
            await role.save();
        } catch (error) {
            return next(error);
        }

        const updatedRole = await Role.findOne({ _id: role.id });

        return res.send({ role: updatedRole });
    }

    public static async deleteRole(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        const server = req.bus.server;
        const role = req.bus.role;

        if (role.id === server.id) {
            return next(new GenericError("The default role cannot be deleted"));
        }

        try {
            await role.remove();
        } catch (error) {
            return next(error);
        }

        return res.send({ role });
    }
}

export default RolesController;