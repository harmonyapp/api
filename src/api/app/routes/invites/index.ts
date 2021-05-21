import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import findInvite from "../../middlewares/buses/findInvite";
import invite from "./invite";

const router = Router();

router.use("/:inviteCode",
    authenticate({ required: true, allowApplications: false }),
    findInvite,
    invite
);

export default router;