import { Router } from "express";
import MyRelationshipsController from "../../../../controllers/users/me/relationships/MyRelationshipsController";
import authenticate from "../../../../middlewares/authenticate";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: false }),
    MyRelationshipsController.getRelationships
);

router.post("/",
    authenticate({ required: true, allowApplications: false }),
    MyRelationshipsController.createRelationship
);

router.put("/:userID",
    authenticate({ required: true, allowApplications: false }),
    MyRelationshipsController.createRelationship
);

export default router;