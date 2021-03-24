import { check } from "express-validator";

const fields = ["name", "topic", "nsfw", "server", "position", "parent", "last_message", "recipient", "recipients", "icon", "owner", "bitrate", "user_limit"];

const channelPolicies = {
    createChannel: [
        check(fields).optional(true)
    ],
    updateChannel: [
        check(fields).optional(true)
    ]
};

export default channelPolicies;