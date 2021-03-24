import { Router } from "express";
import channelPolicies from "../../../../../policies/channelPolicies";
import { ChannelTypes } from "../../../../../util/Constants";
import ChannelController from "../../../controllers/channels/channel/ChannelController";
import authenticate from "../../../middlewares/authenticate";
import findChannel from "../../../middlewares/buses/findChannel";
import messages from "./messages";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ChannelController.getChannel
);

router.patch("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    channelPolicies.updateChannel,
    ChannelController.updateChannel
);

router.delete("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ChannelController.deleteChannel
);

router.post("/invites",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    findChannel({
        type: ChannelTypes.SERVER_TEXT
    }),
    ChannelController.createInvite
);

router.use("/messages", messages);

export default router;