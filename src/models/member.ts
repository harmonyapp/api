import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../helpers/snowflake";
import User from "./user";
import FieldError from "../errors/FieldError";
import { PermissionFlags } from "../util/Constants";
import PermissionUtil from "../util/PermissionUtil";
import Server, { IServerDocument } from "./server";
import { IChannelDocument } from "./channel";
import PermissionString from "../interfaces/PermissionString";

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
    /**
     * Asserts whether the member has a specific permission
     */
    hasPermission(flag: PermissionString, options?: {
        channel?: IChannelDocument,
        server?: IServerDocument
    }): Promise<boolean>;
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

memberSchema.methods.hasPermission = async function (this: IMemberDocument, flag: PermissionString, options?: {
    channel?: IChannelDocument,
    server?: IServerDocument
}): Promise<boolean> {
    const server = options.server || await Server.findOne({ _id: this.server });

    const permission: number = PermissionFlags[flag];

    let permissions = await PermissionUtil.computeBasePermissions(this, server);

    if (options.channel) {
        const overwrites = await PermissionUtil.computeOverwrites(permissions, this, options.channel);

        permissions = permissions | overwrites;
    }

    if ((permissions & permission) !== permission) {
        return false;
    }

    return true;
};

memberSchema.pre<IMemberDocument>("validate", async function (next) {
    const nickname = this.nickname;

    if (nickname && (nickname.length < 1 || nickname.length > 16)) {
        return next(new FieldError(
            "nickname",
            "Nickname must be between 1 and 16 in length"
        ));
    }

    next();
});

memberSchema.pre<IMemberDocument>("save", async function (next) {
    if (this.isNew) {
        this.roles.push(this.server);
    }

    if (this.isModified("nickname")) {
        const user = await User.findOne({ _id: this.user });

        // Setting your nickname to your name or a falsy value resets it
        if (this.nickname === user.username || !this.nickname) {
            this.nickname = undefined;
        }
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
    roles: {
        populate: true
    },
    nickname: true
});

export default Member;