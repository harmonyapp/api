import mongoose, { Schema, Model, Document } from "mongoose";
import FieldError from "../errors/FieldError";
import GenericError from "../errors/GenericError";
import isNumeric from "../helpers/isNumeric";
import snowflake from "../helpers/snowflake";
import { DefaultPermissions } from "../util/Constants";
import PermissionUtil from "../util/PermissionUtil";

export type IRoleModel = Model<IRoleDocument>;

export interface IRoleDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The name of this role
     */
    name: string;
    /**
     * The bits representing the users permissions
     */
    permissions: number;
    /**
     * Whether or not this role is managed
     */
    managed: boolean;
    /**
     * The position of this role.
     * <note>The higher the position, the higher the authority.</note>
     */
    position: number;
    /**
     * The server that this role belongs to
     */
    server: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const roleSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    name: {
        type: Schema.Types.String,
        required: true
    },
    permissions: {
        type: Schema.Types.Number,
        required: true,
        default: DefaultPermissions
    },
    managed: {
        type: Schema.Types.Boolean,
        required: true,
        default: false
    },
    position: {
        type: Schema.Types.Number,
        required: true,
        default: 0
    },
    server: {
        type: Schema.Types.String,
        required: true,
        ref: "Server"
    }
}, {
    timestamps: true
});

roleSchema.pre<IRoleDocument>("validate", function (next) {
    const name = this.name?.trim();

    if (!name) {
        return next(new FieldError("name", "This field is required"));
    }

    if (name.length < 1 || name.length > 24) {
        return next(new FieldError("name", "Role name must be between 1 and 24 in length"));
    }

    if (!isNumeric(this.permissions)) {
        return next(new FieldError("permissions", "This field must be numeric"));
    }

    if (!this.permissions || !PermissionUtil.validatePermissions(this.permissions)) {
        return next(new GenericError("Invalid permissions"));
    }

    return next();
});

const Role: IRoleModel = mongoose.model<IRoleDocument, IRoleModel>("Role", roleSchema);

Role.setPresentableFields({
    name: true,
    permissions: true,
    managed: true,
    position: true,
    server: {
        populate: true
    }
});

export default Role;