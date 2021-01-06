import { Router } from "express";
import findChannel from "../../middlewares/findChannel";
import channel from "./channel";

const router = Router();

router.use("/:channelID",
    findChannel,
    channel
);

export default router;