import { Router } from "express";
import { ChannelTypes } from "../../../../../../util/Constants";
import MyChannelsController from "../../../../controllers/users/me/channels/MyChannelsController";
import authenticate from "../../../../middlewares/authenticate";
import findChannel from "../../../../middlewares/buses/findChannel";
import findUser from "../../../../middlewares/buses/findUser";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: false }),
    MyChannelsController.getChannels
);

router.post("/",
    authenticate({ required: true, allowApplications: false }),
    MyChannelsController.createGroupDMChannel
);

router.put("/:userID",
    authenticate({ required: true, allowApplications: false }),
    findUser,
    MyChannelsController.createDMChannel
);

router.delete("/:channelID",
    authenticate({ required: true, allowApplications: false }),
    findChannel({ types: [ChannelTypes.DM, ChannelTypes.GROUP_DM] }),
    MyChannelsController.deleteChannel
);

export default router;