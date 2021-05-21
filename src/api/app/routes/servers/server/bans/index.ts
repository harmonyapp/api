import { Router } from "express";
import ServerBansController from "../../../../controllers/servers/server/bans/ServerBansController";
import authenticate from "../../../../middlewares/authenticate";
import findBan from "../../../../middlewares/buses/findBan";
import findUser from "../../../../middlewares/buses/findUser";
import checkServerPermissions from "../../../../middlewares/checkServerPermissions";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "BAN_MEMBERS", channelOverwrites: false }),
    ServerBansController.getBans
);

router.get("/:userID",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "BAN_MEMBERS", channelOverwrites: false }),
    findUser,
    findBan,
    ServerBansController.getBan
);

router.put("/:userID",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "BAN_MEMBERS", channelOverwrites: false }),
    findUser,
    ServerBansController.createBan
);

router.delete("/:userID",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "BAN_MEMBERS", channelOverwrites: false }),
    findUser,
    findBan,
    ServerBansController.deleteBan
);

export default router;