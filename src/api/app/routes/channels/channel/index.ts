import { Router } from "express";
import channelPolicies from "../../../../../policies/channelPolicies";
import { ChannelTypes } from "../../../../../util/Constants";
import ChannelController from "../../../controllers/channels/channel/ChannelController";
import authenticate from "../../../middlewares/authenticate";
import findChannel from "../../../middlewares/buses/findChannel";
import checkServerPermissions from "../../../middlewares/checkServerPermissions";
import messages from "./messages";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ChannelController.getChannel
);

router.patch("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_CHANNELS", channelOverwrites: true }),
    channelPolicies.updateChannel,
    ChannelController.updateChannel
);

router.delete("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    findChannel({
        types: [
            ChannelTypes.SERVER_TEXT,
            ChannelTypes.SERVER_VOICE,
            ChannelTypes.SERVER_CATEGORY
        ]
    }),
    checkServerPermissions({ flag: "MANAGE_CHANNELS", channelOverwrites: true }),
    ChannelController.deleteChannel
);

router.post("/invites",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    findChannel({
        types: [ChannelTypes.SERVER_TEXT]
    }),
    checkServerPermissions({ flag: "CREATE_INVITE", channelOverwrites: true }),
    ChannelController.createInvite
);

router.use("/messages", messages);

export default router;