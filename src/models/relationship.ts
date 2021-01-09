import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../helpers/snowflake";
import User from "./user";
import GenericError from "../errors/GenericError";
import { RelationshipTypes } from "../util/Constants";

export type IRelationshipModel = Model<IRelationshipDocument>;

export interface IRelationshipDocument extends Document {
    /**
     * The ID of the document
     */
    id: string;
    /**
     * The user that this relationship belongs to
     */
    user: string;
    /**
     * The user that this relationship concerns
     */
    concerning: string;
    /**
     * The type of the relationship
     * * 1: Friend
     * * 2: Block
     * * 3: Incoming friend request
     * * 4: Outgoing friend request
     */
    type: 1 | 2 | 3 | 4;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
}

const relationshipSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    user: {
        type: Schema.Types.String,
        ref: "User",
        required: true
    },
    concerning: {
        type: Schema.Types.String,
        ref: "User",
        required: true
    },
    type: {
        type: Schema.Types.Number,
        enum: [
            RelationshipTypes.FRIEND,
            RelationshipTypes.BLOCK,
            RelationshipTypes.INCOMING_FRIEND_REQUEST,
            RelationshipTypes.OUTGOING_FRIEND_REQUEST
        ]
    }
}, {
    timestamps: true
});

relationshipSchema.methods.toJSON = function () {
    const relationship = this as IRelationshipDocument;

    // Todo: add "user" property, containing the public properties of a user when async document presentation has been added.
    // I'll add it soon, I just haven't come up with a good name for the function yet
    const newObject = {
        id: relationship.concerning,
        type: relationship.type
    };

    return newObject;
};

relationshipSchema.pre("validate", async function (next) {
    const document = this as IRelationshipDocument;

    const concerning = await User.findOne({ _id: document.concerning });

    if (!concerning) {
        return next(new GenericError("User not found"));
    }

    next();
});

const Relationship: IRelationshipModel = mongoose.model<IRelationshipDocument, IRelationshipModel>("Relationship", relationshipSchema);

export default Relationship;