import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import snowflake from "../helpers/snowflake";

export type IMessageModel = Model<IMessageDocument>;

export interface IMessageDocument extends Document {
    content: string;
    author: string;
    channel: string;
    server: string;
    createdAt: Date;
}

const messageSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    content: {
        type: Schema.Types.String,
        required: true
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
        required: true,
        ref: "Server"
    }
}, {
    timestamps: true
});

messageSchema.methods.toJSON = function () {
    const message = this as IMessageDocument;

    const newObject = {
        id: message.id,
        content: message.content,
        author: message.author,
        channel: message.channel,
        server: message.server
    };

    return newObject;
};

messageSchema.pre("validate", function (next) {
    const document = this as IMessageDocument;

    const content = document.content;

    const messageValidation = config.getProperties().validation.message;

    if (content.length < messageValidation.content.minlength || content.length > messageValidation.content.maxlength) {
        return next(new FieldError(
            "content",
            `Channel topic must be between ${messageValidation.content.minlength} and ${messageValidation.content.maxlength} in length`
        ));
    }

    next();
});

messageSchema.pre("save", async function (next) {
    const document = this as IMessageDocument;

    next();
});

const Message: IMessageModel = mongoose.model<IMessageDocument, IMessageModel>("Message", messageSchema);

export default Message;