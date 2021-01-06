import { Router } from "express";
import ChannelsController from "../../controllers/channels/ChannelsController";
import authenticate from "../../middlewares/authenticate";
import findChannel from "../../middlewares/findChannel";
import channel from "./channel";

const router = Router();

router.use("/:channelID",
    findChannel,
    channel
);

export default router;