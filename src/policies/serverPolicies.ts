import { check } from "express-validator";

const serverPolicies = {
    updateServer: [
        check("name").isString().optional(true)
    ]
};

export default serverPolicies;