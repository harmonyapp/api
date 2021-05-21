import { Router } from "express";
import MeController from "../../../controllers/users/me/MeController";
import authenticate from "../../../middlewares/authenticate";
import relationships from "./relationships";
import channels from "./channels";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    MeController.getUser
);

router.use("/relationships",
    relationships
);

router.use("/channels",
    channels
);

export default router;