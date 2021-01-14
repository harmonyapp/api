import { Response, Request } from "express";
import BaseController from "../../../BaseController";
import Invite from "../../../../../../models/invite";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";

class InvitesController extends BaseController {
    public static async getInvites(req: Request, res: Response): ControllerReturnPromise {
        const invites = await Invite.find({ server: req.bus.server.id });

        return res.send({ invites: invites });
    }
}

export default InvitesController;