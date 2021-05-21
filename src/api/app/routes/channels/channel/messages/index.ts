import { Router } from "express";
import MessagesController from "../../../../controllers/channels/channel/messages/MessagesController";
import authenticate from "../../../../middlewares/authenticate";
import checkServerPermissions from "../../../../middlewares/checkServerPermissions";

const router = Router();

router.get("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "VIEW_MESSAGES" }),
    MessagesController.getMessages
);

router.post("/",
    authenticate({ required: true, allowApplications: true, scopes: ["servers.read"] }),
    checkServerPermissions({ flag: "SEND_MESSAGES" }),
    MessagesController.createMessage
);

export default router;