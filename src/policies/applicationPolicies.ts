import { check } from "express-validator";

const applicationPolicies = {
    createApplication: [
        check("name").isString().optional(true),
        check("scopes").isArray().optional(true)
    ]
};

export default applicationPolicies;