import { Router } from "express";
import rolePolicies from "../../../../../../../policies/rolePolicies";
import RolesController from "../../../../../controllers/servers/server/roles/RolesController";
import authenticate from "../../../../../middlewares/authenticate";
import checkServerPermissions from "../../../../../middlewares/checkServerPermissions";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    RolesController.getRole
);

router.patch("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_ROLES" }),
    rolePolicies.updateRole,
    RolesController.updateRole
);

router.delete("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_ROLES" }),
    RolesController.deleteRole
);

export default router;