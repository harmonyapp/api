import { Router } from "express";
import serverPolicies from "../../../../../policies/serverPolicies";
import ServerController from "../../../controllers/servers/server/ServerController";
import authenticate from "../../../middlewares/authenticate";
import checkServerPermissions from "../../../middlewares/checkServerPermissions";
import channels from "./channels";
import bans from "./bans";
import roles from "./roles";
import members from "./members";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerController.getServer
);

router.patch("/",
    authenticate({ required: true, allowApplications: false }),
    checkServerPermissions({ flag: "MANAGE_SERVER" }),
    serverPolicies.updateServer,
    ServerController.updateServer
);

router.delete("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerController.deleteServer
);

router.use("/bans", bans);
router.use("/channels", channels);
router.use("/members", members);
router.use("/roles", roles);

export default router;