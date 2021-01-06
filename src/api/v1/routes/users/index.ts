import { Router } from "express";
import UsersController from "../../controllers/users/UsersController";
import authenticate from "../../middlewares/authenticate";
import findUser from "../../middlewares/findUser";
import user from "./user";

const router = Router();

router.get("/@me",
    authenticate({ required: true, allowApplications: true }),
    UsersController.getAuthenticatedUser
);

router.use("/:userID",
    authenticate({ required: true, allowApplications: true }),
    findUser,
    user
);

export default router;