import { Router } from "express";
import MemberRolesController from "../../../../../../../controllers/servers/server/members/member/roles/MemberRolesController";
import authenticate from "../../../../../../../middlewares/authenticate";
import checkServerPermissions from "../../../../../../../middlewares/checkServerPermissions";

const router = Router();

router.put("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_ROLES" }),
    MemberRolesController.modifyRole
);

router.delete("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_ROLES" }),
    MemberRolesController.modifyRole
);

export default router;