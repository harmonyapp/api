import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../helpers/snowflake";

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
    permissions: string;
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
        type: Schema.Types.String,
        required: true
    },
    server: {
        type: Schema.Types.String,
        required: true,
        ref: "Server"
    }
}, {
    timestamps: true
});

const Role: IRoleModel = mongoose.model<IRoleDocument, IRoleModel>("Role", roleSchema);

Role.setPresentableFields({
    name: true,
    permissions: true,
    server: {
        populate: true
    }
});

export default Role;