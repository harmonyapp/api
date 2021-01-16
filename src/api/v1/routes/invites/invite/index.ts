import { Router } from "express";
import serverPolicies from "../../../../../policies/serverPolicies";
import InviteController from "../../../controllers/invites/invite/InviteController";
import ServerController from "../../../controllers/servers/server/ServerController";
import authenticate from "../../../middlewares/authenticate";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    InviteController.getInvite
);

router.post("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    InviteController.useInvite
);

export default router;