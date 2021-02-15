import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../helpers/snowflake";
import User from "./user";
import FieldError from "../errors/FieldError";

export type IMemberModel = Model<IMemberDocument>;

export interface IMemberDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The server that this member belongs to
     */
    server: string;
    /**
     * The user that this member 'extends'
     */
    user: string;
    /**
     * The bits representing the users permissions
     */
    permissions: string;
    /**
     * The ID of the roles that have been assigned to this member
     */
    roles: string[];
    /**
     * The nickname of this member, if applicable
     */
    nickname?: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
}

const memberSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    server: {
        type: Schema.Types.String,
        required: true,
        ref: "Server"
    },
    user: {
        type: Schema.Types.String,
        required: true,
        ref: "User"
    },
    roles: [{
        type: Schema.Types.String,
        ref: "Role"
    }],
    nickname: {
        type: Schema.Types.String,
        trim: true
    }
}, {
    timestamps: {
        createdAt: "joinedAt",
        updatedAt: true
    }
});

memberSchema.pre("validate", async function (next) {
    const document = this as IMemberDocument;

    const nickname = document.nickname;

    if (nickname && (nickname.length < 1 || nickname.length > 16)) {
        return next(new FieldError(
            "nickname",
            "Nickname must be between 1 and 16 in length"
        ));
    }

    const user = await User.findOne({ _id: document.user });

    if (nickname === user.username) {
        delete document.nickname;
    }

    next();
});

const Member: IMemberModel = mongoose.model<IMemberDocument, IMemberModel>("Member", memberSchema);

Member.setPresentableFields({
    server: {
        populate: true
    },
    user: {
        populate: true
    },
    roles: true,
    nickname: true
});

export default Member;