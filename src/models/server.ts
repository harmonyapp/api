import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import snowflake from "../helpers/snowflake";
import Channel from "./channel";

export type IServerModel = Model<IServerDocument>;

export interface IServerDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The name of this server
     */
    name: string;
    /**
     * The ID of the user who owns this server
     */
    owner: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const serverSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    name: {
        type: Schema.Types.String,
        trim: true
    },
    owner: {
        type: Schema.Types.String,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true
});

serverSchema.methods.toJSON = function () {
    const server = this as IServerDocument;

    const newObject = {
        id: server.id,
        name: server.name,
        owner_id: server.owner
    };

    return newObject;
};

serverSchema.pre("validate", function (next) {
    const document = this as IServerDocument;

    const name = document.name;

    if (!name) {
        return next(new FieldError("name", "Name is required"));
    }

    const serverValidation = config.getProperties().validation.server;

    if (name.length < serverValidation.name.minlength || name.length > serverValidation.name.maxlength) {
        return next(new FieldError(
            "name",
            `Server name must be between ${serverValidation.name.minlength} and ${serverValidation.name.maxlength} in length`
        ));
    }

    next();
});

serverSchema.pre("save", async function (next) {
    const document = this as IServerDocument;

    const defaultChannel = new Channel({
        name: "general",
        server: document.id,
        position: 0
    });

    await defaultChannel.save();

    next();
});

const Server: IServerModel = mongoose.model<IServerDocument, IServerModel>("Server", serverSchema);

export default Server;