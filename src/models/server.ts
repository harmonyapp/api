import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import snowflake from "../helpers/snowflake";
import Member from "./member";
import ChannelUtil from "../util/ChannelUtil";
import Channel, { IChannelDocument } from "./channel";
import { ChannelTypes } from "../util/Constants";

export type IServerModel = Model<IServerDocument>;

export interface IServerDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The name of this server
     */
    name: string;
    /**
     * The ID of the user who owns this server
     */
    owner: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
    /**
     * Flatten the positions of text and voice channels
     * 
     * @example
     * // This ...
     * [{ position: 2 }, { position: 4 }, { position: 7 }]
     * // ... becomes this
     * [{ position: 0 }, { position: 1 }, { position: 2 }]
     */
    mendChannelPositions({ channel_type, save }: {
        channel_type: "category" | "channel",
        save?: boolean
    }): Promise<[IChannelDocument[]]>;
}

const serverSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    name: {
        type: Schema.Types.String,
        trim: true
    },
    owner: {
        type: Schema.Types.String,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true
});

serverSchema.methods.mendChannelPositions = async function ({
    channel_type,
    save = true
}: {
    channel_type: "category" | "channel",
    save?: boolean
}) {
    const document = this as IServerDocument;

    const serverChannels = await Channel.find({ server: document.id });

    const channels = serverChannels.filter((channel) => {
        if (channel_type === "category") {
            return channel.type === ChannelTypes.SERVER_CATEGORY;
        }

        return channel.type !== ChannelTypes.SERVER_CATEGORY;
    });

    const categories = serverChannels.reduce<IChannelDocument[]>((accumulator, channel) => {
        if (channel.type === ChannelTypes.SERVER_CATEGORY) {
            accumulator.push(channel);
        }

        return accumulator;
    }, []);

    const orphans = serverChannels.filter((channel) => !channel.parent && channel.type !== ChannelTypes.SERVER_CATEGORY);

    ChannelUtil.flattenChannels(categories);
    ChannelUtil.flattenChannels(orphans);

    for (const category of categories) {
        const categoryChannels = channels.filter((channel) => channel.parent === category.id);

        ChannelUtil.flattenChannels(categoryChannels);
    }

    if (save) {
        await Channel.bulkWrite(channels.map((channel) => {
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

    return channels;
};

serverSchema.pre("validate", function (next) {
    const document = this as IServerDocument;

    const name = document.name;

    if (!name) {
        return next(new FieldError("name", "Name is required"));
    }

    const serverValidation = config.getProperties().validation.server;

    if (name.length < serverValidation.name.minlength || name.length > serverValidation.name.maxlength) {
        return next(new FieldError(
            "name",
            `Server name must be between ${serverValidation.name.minlength} and ${serverValidation.name.maxlength} in length`
        ));
    }

    next();
});

serverSchema.pre("save", async function (next) {
    const document = this as IServerDocument;

    if (document.isNew) {
        const defaultCategory = new Channel({
            name: "General",
            server: document.id,
            type: ChannelTypes.SERVER_CATEGORY,
            position: 0
        });

        const defaultChannel = new Channel({
            name: "general",
            server: document.id,
            type: ChannelTypes.SERVER_TEXT,
            position: 0,
            parent: defaultCategory.id
        });

        await defaultCategory.save();
        await defaultChannel.save();
    }

    next();
});

serverSchema.pre("remove", async function (next) {
    const document = this as IServerDocument;

    await Member.deleteMany({ server: document.id });
    await Channel.deleteMany({ server: document.id });

    next();
});

const Server: IServerModel = mongoose.model<IServerDocument, IServerModel>("Server", serverSchema);

Server.setPresentableFields({
    name: true,
    owner: {
        populate: true
    }
});

export default Server;