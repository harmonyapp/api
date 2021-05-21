import { Router } from "express";
import findRole from "../../../../../../middlewares/buses/findRole";
import role from "./role";

const router = Router();

router.use("/:roleID",
    findRole,
    role
);

export default router;