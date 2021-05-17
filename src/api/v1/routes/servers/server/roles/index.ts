import { Router } from "express";
import RolesController from "../../../../controllers/servers/server/roles/RolesController";
import authenticate from "../../../../middlewares/authenticate";
import findRole from "../../../../middlewares/buses/findRole";
import checkServerPermissions from "../../../../middlewares/checkServerPermissions";
import role from "./role";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    RolesController.getRoles
);

router.post("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "MANAGE_ROLES", channelOverwrites: false }),
    RolesController.createRole
);

router.use("/:roleID",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    findRole,
    role
);

export default router;