import { Router } from "express";
import channelPolicies from "../../../../../policies/channelPolicies";
import ChannelController from "../../../controllers/channels/channel/ChannelController";
import authenticate from "../../../middlewares/authenticate";
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

router.post("/invites",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    ChannelController.createInvite
);

router.use("/messages", messages);

export default router;