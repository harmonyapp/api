import { check } from "express-validator";

const rolePolicies = {
    updateRole: [
        check("name").isString().optional(true),
        check("permissions").optional(true)
    ]
};

export default rolePolicies;