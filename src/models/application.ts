import mongoose, { Schema, Model, Document } from "mongoose";
import generateAPIKey from "../helpers/generateAPIKey";
import random from "../helpers/random";
import snowflake from "../helpers/snowflake";
import FieldError from "../errors/FieldError";
import ErrorMessages from "../errors/Messages";
import { Scopes } from "../util/Constants";
import { Scope } from "../interfaces/Scope";

export type IApplicationModel = Model<IApplicationDocument>;

export interface IApplicationDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The name of the application
     */
    name: string;
    /**
     * The token of the application
     */
    token: string;
    /**
     * The ID of the user who owns this application
     */
    user: string;
    /**
     * The scopes that have been granted to this application
     */
    scopes: Scope[];
    /**
     * This will verify if the application is within scope to perform a specific action
     */
    isWithinScope(scopes: Scope[]): boolean;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const applicationSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    name: {
        type: Schema.Types.String,
        required: true,
        default: () => "Application " + random.string(6),
        trim: true
    },
    token: {
        type: Schema.Types.String,
        unique: true,
        required: true,
        default: () => generateAPIKey()
    },
    user: {
        type: Schema.Types.String,
        required: true,
        ref: "User"
    },
    scopes: [{
        type: Schema.Types.String,
        enum: [...Scopes]
    }]
}, {
    timestamps: true
});

applicationSchema.methods.isWithinScope = function (this: IApplicationDocument, scopes: Scope[]) {
    return scopes.every((scope) => this.scopes.indexOf(scope) !== -1);
};

applicationSchema.pre<IApplicationDocument>("validate", function (next) {
    const scopes = this.scopes;
    const invalidScopes = scopes.filter((scope) => Scopes.indexOf(scope) === -1);

    if (invalidScopes.length) {
        return next(new FieldError("scopes", `Invalid scopes "${invalidScopes.join(", ")}"`));
    }

    if (!this.name || this.name.trim().length === 0) {
        return next(new FieldError("name", ErrorMessages.REQUIRED_FIELD));
    }

    next();
});

const Application: IApplicationModel = mongoose.model<IApplicationDocument, IApplicationModel>("Application", applicationSchema);

Application.setPresentableFields({
    name: true,
    token: true,
    user: {
        populate: true
    },
    scopes: true
});

export default Application;