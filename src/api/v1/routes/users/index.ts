import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import findUser from "../../middlewares/findUser";
import me from "./me";
import user from "./user";

const router = Router();

router.use("/@me",
    authenticate({ required: true, allowApplications: true }),
    me
);

router.use("/:userID",
    authenticate({ required: true, allowApplications: true }),
    findUser,
    user
);

export default router;