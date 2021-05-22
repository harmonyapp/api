import { Response, Request, NextFunction } from "express";
import BaseController from "../../../BaseController";
import User from "../../../../../../models/user";
import Relationship from "../../../../../../models/relationship";
import FieldError from "../../../../../../errors/FieldError";
import GenericError from "../../../../../../errors/GenericError";
import ErrorMessages from "../../../../../../errors/Messages";
import HttpStatusCode from "../../../../../../interfaces/HttpStatusCode";
import { ControllerReturnPromise } from "../../../../../../interfaces/ControllerReturn";
import { RelationshipTypes } from "../../../../../../util/Constants";

class MyRelationshipsController extends BaseController {
    public static async getRelationships(req: Request, res: Response): ControllerReturnPromise {
        const relationships = await Relationship.find({ user: req.user.id });

        return res.send({ relationships });
    }

    public static async createRelationship(req: Request, res: Response, next: NextFunction): ControllerReturnPromise {
        // The request can be one of the following:
        // 
        // PUT /users/@me/relationships/:id
        // POST /users/@me/relationships (body: { username: "(username)" })
        // 
        // We want to make sure that either works, by checking for both req.params.id and req.body.username

        if (!req.params.userID && !req.body.username) return next(new FieldError("username", ErrorMessages.REQUIRED_FIELD));

        const user = req.params.userID ?
            await User.findOne({ _id: req.params.userID }) :
            await User.findByUsername(req.body.username);

        // We do not want to disclose whether the user was not found or if the user has been blocked.
        if (!user) {
            return res.status(HttpStatusCode.BAD_REQUEST).send();
        }

        if (user.id === req.user.id) {
            return next(new GenericError("You cannot add yourself as a friend"));
        }

        const type = req.body.type || RelationshipTypes.FRIEND;
        const validTypes = [RelationshipTypes.FRIEND, RelationshipTypes.BLOCK];

        if (validTypes.indexOf(type) === -1) {
            return next(new FieldError("type", "Invalid type"));
        }

        const existingRelationship = await Relationship.findOne({ user: req.user.id, concerning: user.id });
        const existingConcerningRelationship = await Relationship.findOne({ user: user.id, concerning: req.user.id });

        const relationship = existingRelationship ? existingRelationship : new Relationship({
            user: req.user.id,
            concerning: user.id,
            type: type
        });

        if (type === RelationshipTypes.BLOCK) {
            relationship.type = type;

            await relationship.save();

            // If they have a relationship with us, and it's not a block on their end
            if (existingConcerningRelationship && existingConcerningRelationship.type !== RelationshipTypes.BLOCK) {
                await existingConcerningRelationship.remove();
            }

            return res.status(HttpStatusCode.NO_CONTENT).send();
        }

        // By this point, we have asserted that the relationship type is a friend request

        if (existingConcerningRelationship) {
            // If we try to befriend someone that has an outgoing friend request to us
            if (existingConcerningRelationship.type === RelationshipTypes.OUTGOING_FRIEND_REQUEST) {
                existingConcerningRelationship.type = RelationshipTypes.FRIEND;
                existingRelationship.type = RelationshipTypes.FRIEND;

                await existingConcerningRelationship.save();
                await existingRelationship.save();

                return res.status(HttpStatusCode.NO_CONTENT).send();
            }

            // If we try to befriend someone that has blocked us
            if (existingConcerningRelationship.type === RelationshipTypes.BLOCK) {
                return res.status(HttpStatusCode.BAD_REQUEST).send();
            }

            existingRelationship.type = RelationshipTypes.OUTGOING_FRIEND_REQUEST;

            await existingConcerningRelationship.save();

            return res.status(HttpStatusCode.NO_CONTENT).send();
        } else {
            relationship.type = RelationshipTypes.OUTGOING_FRIEND_REQUEST;

            const concerningRelationship = new Relationship({
                user: user.id,
                concerning: req.user.id,
                type: RelationshipTypes.INCOMING_FRIEND_REQUEST
            });

            await relationship.save();
            await concerningRelationship.save();

            return res.status(HttpStatusCode.NO_CONTENT).send();
        }
    }

    public static async deleteRelationship(req: Request, res: Response): ControllerReturnPromise {
        const user = req.params.userID ?
            await User.findOne({ _id: req.params.userID }) :
            await User.findByUsername(req.body.username);

        if (!user) {
            return res.status(HttpStatusCode.BAD_REQUEST).send();
        }

        const relationship = await Relationship.findOne({ user: req.user.id, concerning: user.id });
        const concerning = await Relationship.findOne({ user: user.id, concerning: req.user.id });

        if (!relationship) {
            return res.status(HttpStatusCode.NOT_FOUND).send();
        }

        // If we have blocked the user, we will now be unblocking them
        if (relationship.type === RelationshipTypes.BLOCK) {
            await relationship.remove();
        }

        // If the relationship is an incoming/outgoing request, this will decline/cancel the request
        else if (relationship.type === RelationshipTypes.INCOMING_FRIEND_REQUEST || relationship.type === RelationshipTypes.OUTGOING_FRIEND_REQUEST) {
            await relationship.remove();
            await concerning.remove();
        }

        // If the relationship is an established and mutual friendship, we will unfriend the users
        else {
            await relationship.remove();
            await concerning.remove();
        }

        return res.status(HttpStatusCode.NO_CONTENT).send();
    }
}

/**
 * When a user tries to create a relationship:
 * 
 * Establishing vocabulary:
 *  1. The user it concerns is the user that the relationship request is targeted at.
 *     If I create a relationship with user A, then user A is the user whom the relationship concerns
 * 
 * Types of relations:
 *  1) Friend
 *  2) Blocked
 *  3) Incoming friend request
 *  4) Outgoing friend request
 * 
 * Prerequisites:
 *  - The concerning user has been established as an existing user
 *  - If a type is provided, it's either 1 or 2
 * 
 * Responses:
 *  - If the relationship creation/updating was successful, send an empty 201 response
 *  - If it was not, send an empty 400 response
 * 
 * If there is no existing relationship between the users:
 *  - If it's a block, only create one relationship, belonging to the user who blocked.
 *  - If it's a friend request, create an outgoing friendship relation for the user, and an incoming one for the concerned user.
 * 
 * If there is an existing relationship:
 *  - If the type is the same, disregard.
 *  - If the type goes from 1 (friend) to 2 (block), remove the existing relationship from the concerning user
 *  - If the type goes from 2 (block) to 1 (friend), create an incoming relationship with type 3 for the concerned user,
 *    and an outgoing relationship with type 4, for the user who initiated the request
 * 
 * If the user who created the request has a relationship that concerns them:
 *  - If the type of the concerning relationship is 2, return an empty error
 *  - If the type is an outgoing friend request, affirm the friend request
 */

export default MyRelationshipsController;