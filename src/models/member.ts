import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../helpers/snowflake";
import User from "./user";
import FieldError from "../errors/FieldError";

export type IMemberModel = Model<IMemberDocument>;

export interface IMemberDocument extends Document {
    server: string;
    user: string;
    permissions: string;
    roles: string[];
    nickname?: string;
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

memberSchema.methods.toJSON = function () {
    const member = this as IMemberDocument;

    return member.toObject();
};

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

memberSchema.pre("save", async function (next) {
    const document = this as IMemberDocument;

    next();
});

const Member: IMemberModel = mongoose.model<IMemberDocument, IMemberModel>("Member", memberSchema);

export default Member;