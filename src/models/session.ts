import mongoose, { Schema, Model, Document } from "mongoose";
import generateAPIKey from "../helpers/generateAPIKey";
import snowflake from "../helpers/snowflake";

export type ISessionModel = Model<ISessionDocument>;

export interface ISessionDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The token of the session
     */
    token: string;
    /**
     * The ID of the user that this session belongs to
     */
    user: string;
    /**
     * Whether this session has expired
     */
    expired: boolean;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const sessionSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
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
    }
}, {
    timestamps: true
});

const Session: ISessionModel = mongoose.model<ISessionDocument, ISessionModel>("Session", sessionSchema);

Session.setPresentableFields({
    user: {
        populate: true
    }
});

export default Session;