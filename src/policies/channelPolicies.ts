import { check } from "express-validator";

const fields = ["name", "topic", "nsfw", "position", "parent", "bitrate", "user_limit"];

const channelPolicies = {
    createChannel: [
        check(fields).optional(true)
    ],
    updateChannel: [
        check(fields).optional(true)
    ]
};

export default channelPolicies;