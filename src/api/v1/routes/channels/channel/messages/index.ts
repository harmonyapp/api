import { Router } from "express";
import MessagesController from "../../../../controllers/channels/channel/messages/MessagesController";
import authenticate from "../../../../middlewares/authenticate";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    MessagesController.getMessages
);

router.post("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    MessagesController.createMessage
);

export default router;