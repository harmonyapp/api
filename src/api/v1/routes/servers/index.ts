import { Router } from "express";
import ServersController from "../../controllers/servers/ServersController";
import authenticate from "../../middlewares/authenticate";
import findServer from "../../middlewares/findServer";
import server from "./server";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServersController.getServers
);

router.post("/",
    authenticate({ required: true, allowApplications: false }),
    ServersController.createServer
);

router.use("/:serverID",
    authenticate({ required: true, allowApplications: false }),
    findServer,
    server
);

export default router;