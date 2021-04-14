import mongoose, { Schema, Model, Document } from "mongoose";
import FieldError from "../errors/FieldError";
import snowflake from "../helpers/snowflake";

export type IBanModel = Model<IBanDocument>;

export interface IBanDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The user who has been banned
     */
    user: string;
    /**
     * The server the user was banned from
     */
    server: string;
    /**
     * The moderator who banned the user
     */
    moderator: string;
    /**
     * The reason this user was banned
     */
    reason?: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const banSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    user: {
        type: Schema.Types.String,
        ref: "User",
        required: true
    },
    server: {
        type: Schema.Types.String,
        ref: "Server",
        required: true
    },
    moderator: {
        type: Schema.Types.String,
        ref: "User",
        required: true
    },
    reason: {
        type: Schema.Types.String,
        required: false,
        trim: true
    }
}, {
    timestamps: true
});

banSchema.pre<IBanDocument>("validate", async function (next) {
    if (this.reason) {
        const reason = this.reason.trim();

        if (reason.length > 512) {
            return next(new FieldError("reason", "Reason cannot exceed 512 in length"));
        }
    }
});

const Ban: IBanModel = mongoose.model<IBanDocument, IBanModel>("Ban", banSchema);

Ban.setPresentableFields({
    user: {
        populate: true
    },
    server: {
        populate: true
    },
    moderator: false,
    reason: true,
    createdAt: true
});

export default Ban;