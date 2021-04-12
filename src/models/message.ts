import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import ErrorMessages from "../errors/Messages";
import snowflake from "../helpers/snowflake";

export type IMessageModel = Model<IMessageDocument>;

export interface IMessageDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The content of the message
     */
    content: string;
    /**
     * The ID of the user who sent this message
     */
    author: string;
    /**
     * The channel that this message was sent to
     */
    channel: string;
    /**
     * The server that this message belongs to.
     * <note>Only available on messages sent in a server</note>
     */
    server?: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const messageSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    content: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.String,
        required: true,
        ref: "User"
    },
    channel: {
        type: Schema.Types.String,
        required: true,
        ref: "Channel"
    },
    server: {
        type: Schema.Types.String,
        ref: "Server"
    }
}, {
    timestamps: true
});

messageSchema.pre<IMessageDocument>("validate", function (next) {
    const content = this.content?.trim();

    if (!content) {
        return next(new FieldError("content", ErrorMessages.REQUIRED_FIELD));
    }

    const messageValidation = config.getProperties().validation.message;

    if (content.length < messageValidation.content.minlength || content.length > messageValidation.content.maxlength) {
        return next(new FieldError(
            "content",
            `Channel topic must be between ${messageValidation.content.minlength} and ${messageValidation.content.maxlength} in length`
        ));
    }

    next();
});

const Message: IMessageModel = mongoose.model<IMessageDocument, IMessageModel>("Message", messageSchema);

Message.setPresentableFields({
    content: true,
    author: {
        populate: true
    },
    channel: {
        populate: true
    },
    server: {
        populate: true
    },
    createdAt: true,
    updatedAt: true
});

export default Message;