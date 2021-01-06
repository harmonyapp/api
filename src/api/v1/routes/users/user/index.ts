import { Router } from "express";
import UserController from "../../../controllers/users/user/UserController";
import authenticate from "../../../middlewares/authenticate";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    UserController.getUser
);

export default router;