import { Router } from "express";
import MyMemberController from "../../../../../controllers/servers/server/members/me/MyMemberController";
import authenticate from "../../../../../middlewares/authenticate";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    MyMemberController.getMember
);

router.patch("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    MyMemberController.updateNickname
);

export default router;