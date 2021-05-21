import { Router } from "express";
import MembersController from "../../../../controllers/servers/server/members/MembersController";
import authenticate from "../../../../middlewares/authenticate";
import member from "./member";
import me from "./me";
import findMember from "../../../../middlewares/buses/findMember";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    MembersController.getMembers
);

router.use("/@me", me);

router.use("/:userID",
    findMember,
    member
);

export default router;