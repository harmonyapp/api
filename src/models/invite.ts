import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../helpers/snowflake";

export type IInviteModel = Model<IInviteDocument>;

export interface IInviteDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
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

inviteSchema.methods.getPresentableObject = async function () {
    const invite = this as IInviteDocument;

    await invite.populate("user").execPopulate();
    await invite.populate("server").execPopulate();
    await invite.populate("channel").execPopulate();

    const newObject = {
        id: invite.id,
        user: invite.user,
        server: invite.server,
        channel: invite.channel,
        uses: invite.uses
    };

    return newObject;
};

inviteSchema.pre("validate", function (next) {
    // const document = this as IInviteDocument;

    next();
});

// inviteSchema.pre("save", async function (next) {
//     const document = this as IInviteDocument;

//     next();
// });

const Invite: IInviteModel = mongoose.model<IInviteDocument, IInviteModel>("Invite", inviteSchema);

export default Invite;