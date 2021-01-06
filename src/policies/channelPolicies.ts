import { check } from "express-validator";

const channelPolicies = {
    updateChannel: [
        check("name").isString().optional(true),
        check("position").isString().optional(true)
    ]
};

export default channelPolicies;