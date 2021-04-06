import mongoose, { Schema, Model, Document } from "mongoose";
import config from "../../config/config";
import FieldError from "../errors/FieldError";
import snowflake from "../helpers/snowflake";
import Member from "./member";
import { ChannelTypes } from "../util/Constants";
import Channel, { IChannelDocument } from "./channel";

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
    mendChannelPositions({ channel_type, parent_id, save }: {
        channel_type: "category" | "channel",
        parent_id?: string,
        save?: boolean
    }): Promise<[IChannelDocument[], boolean]>;
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

serverSchema.methods.mendChannelPositions = async function ({ channel_type, parent_id = null, save = true }: { channel_type: "category" | "channel", parent_id?: string, save?: boolean }) {
    const document = this as IServerDocument;

    const siblingExcludeQuery = channel_type === "category" ? {
        $nin: [ChannelTypes.SERVER_TEXT, ChannelTypes.SERVER_VOICE]
    } : { $ne: ChannelTypes.SERVER_CATEGORY };

    const channels = await Channel.find({ server: document.id, type: siblingExcludeQuery, parent: parent_id });

    const valueToIncides = new Map();

    const copy = [...channels];

    const sorted = copy.sort((a, b) => a.position > b.position ? 1 : ((b.position > a.position) ? -1 : 0));

    let shouldUpdate = false;

    for (let i = 0; i < channels.length; i++) valueToIncides.set(sorted[i].id, i);

    for (let i = 0; i < channels.length; i++) {
        const index = valueToIncides.get(channels[i].id);

        if (channels[i].position !== index) {
            shouldUpdate = true;

            channels[i].position = index;
        }
    }

    if (shouldUpdate && save) {
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

    // Renaming the variable is purely to clarify why we're sending it back
    const didUpdate = shouldUpdate;

    return [channels, didUpdate];
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
        const defaultChannel = new Channel({
            name: "general",
            server: document.id,
            type: ChannelTypes.SERVER_TEXT,
            position: 0
        });

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