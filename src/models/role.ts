import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import snowflake from "../helpers/snowflake";

export type IRoleModel = Model<IRoleDocument>;

export interface IRoleDocument extends Document {
    server: string;
    createdAt: Date;
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

roleSchema.methods.toJSON = function () {
    const role = this as IRoleDocument;

    return role.toObject();
};

roleSchema.pre("validate", function (next) {
    const document = this as IRoleDocument;

    next();
});

roleSchema.pre("save", async function (next) {
    const document = this as IRoleDocument;

    next();
});

const Role: IRoleModel = mongoose.model<IRoleDocument, IRoleModel>("Role", roleSchema);

export default Role;