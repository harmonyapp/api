import { Router } from "express";
import channelPolicies from "../../../../../../policies/channelPolicies";
import ServerChannelsController from "../../../../controllers/servers/server/channels/ServerChannelsController";
import authenticate from "../../../../middlewares/authenticate";
import checkServerPermissions from "../../../../middlewares/checkServerPermissions";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ServerChannelsController.getChannels
);

router.post("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_CHANNELS" }),
    channelPolicies.createChannel,
    ServerChannelsController.createChannel
);

router.patch("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_CHANNELS" }),
    ServerChannelsController.updateChannels
);

export default router;