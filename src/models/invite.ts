import mongoose, { Schema, Model, Document } from "mongoose";
import random from "../helpers/random";
import snowflake from "../helpers/snowflake";

export type IInviteModel = Model<IInviteDocument>;

export interface IInviteDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The code for this invite
     */
    code: string;
    /**
     * The user that created this invite
     */
    user: string;
    /**
     * The server that this invite belongs to
     */
    server: string;
    /**
     * The channel that this invite belongs to
     */
    channel: string;
    /**
     * The amount of uses this invite has
     */
    uses: number;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const inviteSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    code: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        default: () => random.alpha(12)
    },
    user: {
        type: Schema.Types.String,
        required: true,
        ref: "User"
    },
    server: {
        type: Schema.Types.String,
        required: true,
        ref: "Server"
    },
    channel: {
        type: Schema.Types.String,
        required: true,
        ref: "Channel"
    },
    uses: {
        type: Schema.Types.Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

const Invite: IInviteModel = mongoose.model<IInviteDocument, IInviteModel>("Invite", inviteSchema);

Invite.setPresentableFields({
    code: true,
    user: true,
    server: {
        populate: true
    },
    channel: {
        populate: true
    },
    uses: true
});

export default Invite;