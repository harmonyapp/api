import { Router } from "express";
import { ChannelTypes } from "../../../../util/Constants";
import findChannel from "../../middlewares/buses/findChannel";
import channel from "./channel";

const router = Router();

router.use("/:channelID",
    findChannel({
        types: Object.values(ChannelTypes)
    }),
    channel
);

export default router;