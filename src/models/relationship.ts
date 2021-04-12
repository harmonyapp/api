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

relationshipSchema.pre<IRelationshipDocument>("validate", async function (next) {
    const concerning = await User.findOne({ _id: this.concerning });

    if (!concerning) {
        return next(new GenericError("User not found"));
    }

    next();
});

const Relationship: IRelationshipModel = mongoose.model<IRelationshipDocument, IRelationshipModel>("Relationship", relationshipSchema);

Relationship.setPresentableFields({
    user: {
        populate: true
    },
    concerning: {
        populate: true
    },
    type: true
});

export default Relationship;