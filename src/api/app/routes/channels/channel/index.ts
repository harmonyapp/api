import { Router } from "express";
import channelPolicies from "../../../../../policies/channelPolicies";
import { ChannelTypes } from "../../../../../util/Constants";
import ServerChannelController from "../../../controllers/channels/channel/ServerChannelController";
import DMChannelController from "../../../controllers/channels/channel/DMChannelController";
import authenticate from "../../../middlewares/authenticate";
import findChannel from "../../../middlewares/buses/findChannel";
import checkServerPermissions from "../../../middlewares/checkServerPermissions";
import messages from "./messages";

const router = Router();

//#region ServerChannels

router.get("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.SERVER_TEXT,
            ChannelTypes.SERVER_VOICE,
            ChannelTypes.SERVER_CATEGORY
        ],
        passthrough: true
    }),
    ServerChannelController.getChannel
);

router.patch("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.SERVER_TEXT,
            ChannelTypes.SERVER_VOICE,
            ChannelTypes.SERVER_CATEGORY
        ],
        passthrough: true
    }),
    checkServerPermissions({ flag: "MANAGE_CHANNELS", channelOverwrites: true }),
    channelPolicies.updateChannel,
    ServerChannelController.updateChannel
);

router.delete("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.SERVER_TEXT,
            ChannelTypes.SERVER_VOICE,
            ChannelTypes.SERVER_CATEGORY
        ],
        passthrough: true
    }),
    checkServerPermissions({ flag: "MANAGE_CHANNELS", channelOverwrites: true }),
    ServerChannelController.deleteChannel
);

router.post("/invites",
    authenticate({ required: true }),
    findChannel({
        types: [ChannelTypes.SERVER_TEXT]
    }),
    checkServerPermissions({ flag: "CREATE_INVITE", channelOverwrites: true }),
    ServerChannelController.createInvite
);

//#endregion

//#region DMChannels

router.get("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.DM,
            ChannelTypes.GROUP_DM
        ]
    }),
    DMChannelController.getChannel
);

router.delete("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.DM,
            ChannelTypes.GROUP_DM
        ]
    }),
    DMChannelController.deleteChannel
);

//#endregion

router.use("/messages", messages);

export default router;