import { check } from "express-validator";

const accountPolicies = {
    patchAccount: [
        check("username").isString().optional(true),
        check("password").isString().optional(true),
        check("confirmPassword").isString().optional(true)
    ]
};

export default accountPolicies;