import config from "../../../../../../../config/config";
import { Response, Request, NextFunction } from "express";
import BaseController from "../../../BaseController";
import Server from "../../../../../../models/server";
import Member from "../../../../../../models/member";
import Invite from "../../../../../../models/invite";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import GenericError from "../../../../../../errors/GenericError";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";

class InvitesController extends BaseController {
    public static async getInvites(req: Request, res: Response): ControllerReturnPromise {
        const invites = await Invite.find({ server: req.bus.server.id });

        return res.send({ invites: invites });
    }
}

export default InvitesController;