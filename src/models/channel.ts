import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import GenericError from "../errors/GenericError";
import snowflake from "../helpers/snowflake";
import HttpStatusCode from "../interfaces/HttpStatusCode";
import User from "./user";
import { ChannelTypes } from "../util/Constants";
import ChannelUtil from "../util/ChannelUtil";

export type IChannelModel = Model<IChannelDocument>;

export interface IChannelDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The name of the channel.
     * <note>Available on Server Text, Server Voice, and Server Category Channels</note>
     */
    name?: string;
    /**
     * The topic of the channel.
     * <note>Available on Server Text Channel</note>
     */
    topic?: string;
    /**
     * Whether this channel is marked as NSFW or not.
     * <note>Available on Server Text Channel</note>
     */
    nsfw?: boolean;
    /**
     * The server that this channel belongs to.
     * <note>Available on Server Text, Server Voice, and Server Category Channels</note>
     */
    server?: string;
    /**
     * The position of this channel.
     * <note>Available on Server Text, Server Voice, and Server Category Channels</note>
     */
    position?: number;
    /**
     * The type of the Channel
     * * 1: Server Text Channel
     * * 2: Server Voice Channel
     * * 3: Server Category Channel
     * * 4: DM Channel
     * * 5: Group DM Channel
     */
    type: typeof ChannelTypes[keyof typeof ChannelTypes];
    /**
     * The ID of the parent category.
     * <note>Only available on Server Text and Server Voice Channels</note>
     */
    parent?: string;
    /**
     * The ID of the last message to be sent.
     * <note>Only available on Server Text, Group DM, and DM Channels</note>
     */
    last_message?: string;
    /**
     * The array of IDs of the recipient.
     * <note>Only available on Group DM or DM Channels</note>
     */
    recipients?: string[];
    /**
     * The array of IDs of the users who can view this channel in their DM list. i.e. the people who haven't closed the channel on their end.
     * <note>Only available on Group DM or DM Channels</note>
     */
    visible_to?: string[];
    /**
     * The user who owns this channel.
     * <note>Only available on Group DM Channels</note>
     */
    owner?: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
    /**
     * Asserts whether the field is applicable for the passed type
     */
    isFieldApplicable(field: keyof Omit<IChannelDocument, keyof Omit<keyof Document, "id">>, type: 1 | 2 | 3 | 4 | 5): boolean;
    /**
     * Asserts whether the channel can be swapped with another channel of the provided type
     */
    isSwappableWith(type: typeof ChannelTypes[keyof typeof ChannelTypes]): boolean;
    /**
     * Gets the channel siblings
     */
    getSiblings(): Promise<IChannelDocument[]>;
}

const channelSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    name: {
        type: Schema.Types.String,
        trim: true
    },
    topic: {
        type: Schema.Types.String,
        trim: true
    },
    type: {
        type: Schema.Types.Number,
        enum: [
            ChannelTypes.SERVER_TEXT,
            ChannelTypes.SERVER_VOICE,
            ChannelTypes.SERVER_CATEGORY,
            ChannelTypes.DM,
            ChannelTypes.GROUP_DM
        ],
        required: true
    },
    nsfw: {
        type: Schema.Types.Boolean
    },
    server: {
        type: Schema.Types.String,
        ref: "Server"
    },
    position: {
        type: Schema.Types.Number
    },
    parent: {
        type: Schema.Types.String,
        ref: "Channel"
    },
    last_message: {
        type: Schema.Types.String,
        ref: "Message"
    },
    recipients: {
        type: [{
            type: Schema.Types.String,
            ref: "User"
        }],
        default: undefined
    },
    visible_to: {
        type: [{
            type: Schema.Types.String,
            ref: "User"
        }],
        default: undefined
    },
    owner: {
        type: Schema.Types.String,
        ref: "User"
    }
}, {
    timestamps: true
});

const CHANNEL_FIELDS = {
    name: [ChannelTypes.SERVER_TEXT, ChannelTypes.SERVER_VOICE, ChannelTypes.SERVER_CATEGORY],
    topic: [ChannelTypes.SERVER_TEXT],
    nsfw: [ChannelTypes.SERVER_TEXT],
    server: [ChannelTypes.SERVER_TEXT, ChannelTypes.SERVER_VOICE, ChannelTypes.SERVER_CATEGORY],
    position: [ChannelTypes.SERVER_TEXT, ChannelTypes.SERVER_VOICE, ChannelTypes.SERVER_CATEGORY],
    parent: [ChannelTypes.SERVER_TEXT, ChannelTypes.SERVER_VOICE],
    last_message: [ChannelTypes.SERVER_TEXT, ChannelTypes.DM, ChannelTypes.GROUP_DM],
    recipients: [ChannelTypes.GROUP_DM, ChannelTypes.DM],
    visible_to: [ChannelTypes.GROUP_DM, ChannelTypes.DM],
    owner: [ChannelTypes.GROUP_DM]
};

channelSchema.methods.isFieldApplicable = function (field: keyof Omit<IChannelDocument, keyof Document>, type: 1 | 2 | 3 | 4 | 5) {
    return CHANNEL_FIELDS[field].indexOf(type) !== -1;
};

channelSchema.methods.getSiblings = async function () {
    const document = this as IChannelDocument;

    const siblingExcludeQuery = document.type === ChannelTypes.SERVER_CATEGORY ? {
        $nin: [ChannelTypes.SERVER_TEXT, ChannelTypes.SERVER_VOICE]
    } : { $ne: ChannelTypes.SERVER_CATEGORY };

    const siblings = await Channel.find({ type: siblingExcludeQuery, server: document.server });

    return siblings;
};

channelSchema.methods.isSwappableWith = function (type: typeof ChannelTypes[keyof typeof ChannelTypes]) {
    const document = this as IChannelDocument;

    if (document.type === ChannelTypes.SERVER_TEXT || document.type === ChannelTypes.SERVER_VOICE) {
        return (
            [
                ChannelTypes.SERVER_TEXT,
                ChannelTypes.SERVER_VOICE
            ] as typeof ChannelTypes[keyof typeof ChannelTypes][]
        ).indexOf(type) !== -1;
    }

    if (document.type === ChannelTypes.SERVER_CATEGORY) {
        return type === ChannelTypes.SERVER_CATEGORY;
    }

    return false;
};

channelSchema.pre("validate", async function (next) {
    const document = this as IChannelDocument;

    const { name, topic, nsfw, position, type, parent, recipients, server } = document;

    const channels = await Channel.find({ server: server });

    if (Object.values(ChannelTypes).indexOf(type) === -1) {
        return next(new FieldError("type", "Invalid channel type"));
    }

    // The fields that cannot be omitted, if they are applicable to the type
    const nonOmittableIfApplicable = ["name"];

    const fieldErrors = new FieldError();

    for (const field of Object.keys(CHANNEL_FIELDS)) {
        if (document[field] && !document.isFieldApplicable(field as keyof typeof CHANNEL_FIELDS, type)) {
            fieldErrors.addError(field, "This field is not applicable for this channel type");
        }
    }

    if (fieldErrors.hasErrors()) {
        return next(fieldErrors);
    }

    for (const field of nonOmittableIfApplicable) {
        if (!document[field] && document.isFieldApplicable(field as keyof typeof CHANNEL_FIELDS, type)) {
            return next(new FieldError(field, "This field is required"));
        }
    }

    const channelValidation = config.getProperties().validation.channel;

    if (name) {
        // All channels have the same length restrictions on the name
        if (name.length < channelValidation.name.minlength || name.length > channelValidation.name.maxlength) {
            return next(new FieldError(
                "name",
                `Channel name must be between ${channelValidation.name.minlength} and ${channelValidation.name.maxlength} in length`
            ));
        }

        if (document.type === ChannelTypes.SERVER_TEXT) {
            document.name = document.name.replaceAll(" ", "-").toLowerCase();
        }
    }

    if (topic) {
        if (topic.length && (topic.length < channelValidation.topic.minlength || topic.length > channelValidation.topic.maxlength)) {
            return next(new FieldError(
                "topic",
                `Channel topic must be between ${channelValidation.topic.minlength} and ${channelValidation.topic.maxlength} in length`
            ));
        }
    }

    if (nsfw) {
        if (typeof nsfw !== "boolean") {
            return next(new FieldError("nsfw", "NSFW must be a boolean"));
        }
    }

    if (position) {
        if (typeof position !== "number" || position < 0) {
            return next(new FieldError("position", "Position must be a positive number"));
        }
    }

    if (parent) {
        if (!channels.find((channel) => channel.id === parent && channel.type === ChannelTypes.SERVER_CATEGORY)) {
            return next(new FieldError("parent", "Parent must be a valid category channel"));
        }
    }

    if (document.isFieldApplicable("server", document.type)) {
        const maxChannels = 200;

        if (channels.length >= maxChannels) {
            return next(
                new GenericError("You cannot create more than " + maxChannels + " channels")
                    .setHttpStatusCode(HttpStatusCode.UNPROCESSABLE_ENTITY)
            );
        }
    }

    if (recipients) {
        const recipientDocuments = await User.find({ _id: { $in: recipients } });

        if (recipientDocuments.find((recipient) => !recipient)) {
            return next(new FieldError("recipient", "All recipients must be valid users"));
        }
    }

    next();
});

channelSchema.pre("remove", async function (next) {
    const document = this as IChannelDocument;

    if (document.type === ChannelTypes.SERVER_CATEGORY) {
        const channels = await Channel.find({ server: document.server });

        const orphans = ChannelUtil.sortByPosition(channels.filter((channel) => !channel.parent && channel.type !== ChannelTypes.SERVER_CATEGORY));
        const affectedChannels = ChannelUtil.sortByPosition(channels.filter((channel) => channel.parent === document.id));

        const updatedChannels = affectedChannels.map((channel) => {
            channel.parent = null;

            return channel;
        });

        ChannelUtil.flattenChannels(ChannelUtil.bumpChannels([...orphans, ...updatedChannels]));

        await Channel.bulkWrite(updatedChannels.map((channel) => {
            return {
                updateOne: {
                    filter: {
                        _id: channel.id
                    },
                    update: channel.toObject()
                }
            };
        }));
    }

    return next();
});

const Channel: IChannelModel = mongoose.model<IChannelDocument, IChannelModel>("Channel", channelSchema);

Channel.setPresentableFields({
    name() {
        return this.isFieldApplicable("name", this.type);
    },
    topic() {
        return this.isFieldApplicable("topic", this.type);
    },
    nsfw() {
        return this.isFieldApplicable("nsfw", this.type);
    },
    server() {
        return this.isFieldApplicable("server", this.type) && { populate: true };
    },
    // Type should always be divulged, since it is always applicable.
    // The client should be able to figure this out on it's own, but there is no reason not to provide it
    type: true,
    position() {
        return this.isFieldApplicable("position", this.type);
    },
    parent() {
        return this.isFieldApplicable("parent", this.type) && { populate: true };
    },
    last_message() {
        return this.isFieldApplicable("last_message", this.type) && { populate: true };
    },
    recipients() {
        return this.isFieldApplicable("recipients", this.type) && { populate: true };
    },
    owner() {
        return this.isFieldApplicable("owner", this.type) && { populate: true };
    }
});

export default Channel;