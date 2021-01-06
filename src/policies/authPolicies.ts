import { check } from "express-validator";

const authPolicies = {
    register: [
        check("username").isString().optional(true),
        check("email").isString().optional(true),
        check("password").isString().optional(true)
    ]
};

export default authPolicies;