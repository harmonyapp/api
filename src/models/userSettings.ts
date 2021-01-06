import config from "../../config/config";
import mongoose, { Schema, Model, Document, DocumentToObjectOptions } from "mongoose";
import snowflake from "../helpers/snowflake";

export type IUserSettingsModel = Model<IUserSettingsDocument>;

interface toJSONOptions extends DocumentToObjectOptions {
    isUnlocked?: boolean;
}

export interface IUserSettingsDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The ID of the user that this document belongs to
     */
    user: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;

    toJSON(options?: toJSONOptions): Record<string, unknown>;
}

const userSettingsSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    user: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        ref: "User"
    }
}, {
    timestamps: true
});

// userSettingsSchema.pre("validate", function (next) {
//     const document = this as IUserSettingsDocument;

//     // 

//     next();
// });

const UserSettings: IUserSettingsModel = mongoose.model<IUserSettingsDocument, IUserSettingsModel>("UserSettings", userSettingsSchema);

export default UserSettings;