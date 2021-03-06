import { Router } from "express";
import ServerBansController from "../../../../controllers/servers/server/bans/ServerBansController";
import authenticate from "../../../../middlewares/authenticate";
import findBan from "../../../../middlewares/buses/findBan";
import findUser from "../../../../middlewares/buses/findUser";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerBansController.getBans
);

router.get("/:userID",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    findUser,
    findBan,
    ServerBansController.getBan
);

router.put("/:userID",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    findUser,
    ServerBansController.createBan
);

router.delete("/:userID",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    findUser,
    findBan,
    ServerBansController.deleteBan
);

export default router;