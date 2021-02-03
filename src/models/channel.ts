import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import ErrorMessages from "../errors/Messages";
import snowflake from "../helpers/snowflake";

export type IChannelModel = Model<IChannelDocument>;

export interface IChannelDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The name of the channel
     */
    name: string;
    /**
     * The topic of the channel
     */
    topic?: string;
    /**
     * Whether this channel is marked as NSFW or not
     */
    nsfw: boolean;
    /**
     * The server that this channel belongs to
     */
    server: string;
    /**
     * The position of this channel
     */
    position: number;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const channelSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    name: {
        type: Schema.Types.String,
        required: true,
        trim: true,
        lowercase: true
    },
    topic: {
        type: Schema.Types.String,
        trim: true
    },
    nsfw: {
        type: Schema.Types.Boolean,
        required: true,
        default: false
    },
    server: {
        type: Schema.Types.String,
        required: true,
        ref: "Server"
    },
    position: {
        type: Schema.Types.Number,
        required: true
    }
}, {
    timestamps: true
});

channelSchema.methods.toJSON = function () {
    const channel = this as IChannelDocument;

    const newObject = {
        id: channel.id,
        name: channel.name,
        topic: channel.topic,
        nsfw: channel.nsfw,
        server: channel.server,
        position: channel.position
    };

    return newObject;
};

channelSchema.pre("validate", function (next) {
    const document = this as IChannelDocument;

    const name = document.name;
    const topic = document.topic;
    const nsfw = document.nsfw;

    // TODO: Add validation for position when it becomes a thing

    const channelValidation = config.getProperties().validation.channel;

    if (!name) {
        return next(new FieldError("name", ErrorMessages.REQUIRED_FIELD));
    }

    if (name.length < channelValidation.name.minlength || name.length > channelValidation.name.maxlength) {
        return next(new FieldError(
            "name",
            `Channel name must be between ${channelValidation.name.minlength} and ${channelValidation.name.maxlength} in length`
        ));
    }

    if (!channelValidation.name.regex.test(name)) {
        return next(new FieldError("name", "Invalid channel name"));
    }


    if (topic?.length && (topic.length < channelValidation.topic.minlength || topic.length > channelValidation.topic.maxlength)) {
        return next(new FieldError(
            "topic",
            `Channel topic must be between ${channelValidation.topic.minlength} and ${channelValidation.topic.maxlength} in length`
        ));
    }

    if (typeof nsfw !== "boolean") {
        return next(new FieldError(
            "nsfw",
            `NSFW must be a boolean`
        ));
    }

    next();
});

// channelSchema.pre("save", async function (next) {
//     const document = this as IChannelDocument;

//     next();
// });

const Channel: IChannelModel = mongoose.model<IChannelDocument, IChannelModel>("Channel", channelSchema);

export default Channel;