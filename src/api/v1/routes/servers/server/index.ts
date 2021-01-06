import { Router } from "express";
import serverPolicies from "../../../../../policies/serverPolicies";
import ServerController from "../../../controllers/servers/server/ServerController";
import authenticate from "../../../middlewares/authenticate";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerController.getServer
);

router.get("/channels",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerController.getChannels
);

router.post("/channels",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerController.createChannel
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

export default router;