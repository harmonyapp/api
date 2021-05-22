import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import findChannel from "../../middlewares/buses/findChannel";
import channel from "./channel";
import { ChannelTypes } from "../../../../util/Constants";

const router = Router();

router.use("/:channelID",
    authenticate({ required: true }),
    findChannel({ types: Object.values(ChannelTypes) }),
    channel
);

export default router;