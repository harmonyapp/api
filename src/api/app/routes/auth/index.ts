import { Router } from "express";
import authenticate from "../../middlewares/authenticate";
import AuthController from "../../controllers/auth/AuthController";
import authPolicies from "../../../../policies/authPolicies";
import ratelimit from "../../middlewares/ratelimit";

const router = Router();

router.post("/register",
    authenticate({ required: false, allowApplications: false }),
    ratelimit({ max: 10 }),
    authPolicies.register,
    AuthController.register
);

router.post("/login",
    authenticate({ required: false, allowApplications: false }),
    ratelimit({ max: 10 }),
    AuthController.login
);

router.post("/logout",
    authenticate({ required: true, allowApplications: false }),
    AuthController.logout
);

export default router;