import { Router } from "express";
import MessagesController from "../../../../controllers/channels/channel/messages/MessagesController";
import authenticate from "../../../../middlewares/authenticate";
import checkServerPermissions from "../../../../middlewares/checkServerPermissions";
import findChannel from "../../../../middlewares/buses/findChannel";
import { ChannelTypes } from "../../../../../../util/Constants";

const router = Router();

router.get("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.SERVER_TEXT
        ],
        passthrough: true
    }),
    checkServerPermissions({ flag: "VIEW_MESSAGES" }),
    MessagesController.getMessages
);

router.post("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.SERVER_TEXT
        ],
        passthrough: true
    }),
    checkServerPermissions({ flag: "SEND_MESSAGES" }),
    MessagesController.createMessage
);

router.get("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.DM,
            ChannelTypes.GROUP_DM
        ]
    }),
    MessagesController.getMessages
);

router.post("/",
    authenticate({ required: true }),
    findChannel({
        types: [
            ChannelTypes.DM,
            ChannelTypes.GROUP_DM
        ]
    }),
    MessagesController.createMessage
);

export default router;