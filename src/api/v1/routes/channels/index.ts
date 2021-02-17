import { Router } from "express";
import findChannel from "../../middlewares/buses/findChannel";
import channel from "./channel";

const router = Router();

router.use("/:channelID",
    findChannel,
    channel
);

export default router;