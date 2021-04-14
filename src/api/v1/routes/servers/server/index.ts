import { Router } from "express";
import serverPolicies from "../../../../../policies/serverPolicies";
import ServerController from "../../../controllers/servers/server/ServerController";
import authenticate from "../../../middlewares/authenticate";
import channels from "./channels";
import bans from "./bans";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerController.getServer
);

router.patch("/",
    authenticate({ required: true, allowApplications: false }),
    serverPolicies.updateServer,
    ServerController.updateServer
);

router.delete("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerController.deleteServer
);

router.use("/channels", channels);
router.use("/bans", bans);

export default router;