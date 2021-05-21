import { Router } from "express";
import ApplicationsController from "../../controllers/applications/ApplicationsController";
import authenticate from "../../middlewares/authenticate";
import ratelimit from "../../middlewares/ratelimit";

const router = Router();

router.get("/",
    authenticate({ allowApplications: false, required: true }),
    ratelimit(),
    ApplicationsController.getApplications
);

router.get("/:id",
    authenticate({ allowApplications: false, required: true }),
    ratelimit(),
    ApplicationsController.getApplicationByID
);

router.post("/",
    authenticate({ allowApplications: false, required: true }),
    ratelimit({
        windowMs: 1 * 60 * 1000,
        max: 10
    }),
    ApplicationsController.createApplication
);

export default router;