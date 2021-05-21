import { Router } from "express";
import MemberController from "../../../../../controllers/servers/server/members/member/MemberController";
import authenticate from "../../../../../middlewares/authenticate";
import roles from "./roles";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    MemberController.getMember
);

router.patch("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    // This endpoint has different permissions depending on what is send in the body,
    // therefore, the permissions checks are performed inside
    MemberController.updateMember
);

router.use("/roles", roles);

export default router;