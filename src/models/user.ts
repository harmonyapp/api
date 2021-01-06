import config from "../../config/config";
import validator from "validator";
import bcrypt from "bcryptjs";
import mongoose, { Schema, Model, Document, DocumentToObjectOptions } from "mongoose";
import snowflake from "../helpers/snowflake";
import escapeRegex from "../helpers/escapeRegex";
import scorePassword from "../helpers/scorePassword";
import Session, { ISessionDocument } from "./session";
import UserSettings from "./userSettings";
import FieldError from "../errors/FieldError";
import { UsernameRegex } from "../util/Constants";

interface toJSONOptions extends DocumentToObjectOptions {
    /**
     * Whether the returned object should contain only public properties
     */
    isPublic?: boolean;
}

export interface IUserModel extends Model<IUserDocument> {
    /**
     * Find a user by their username (non case sensitive)
     */
    findByUsername(username: string): Promise<IUserDocument | null>;
    /**
     * Find a user by their credentials
     */
    findByCredentials(username: string, password: string): Promise<IUserDocument | false>;
}

export interface IUserDocument extends Document {
    /**
     * The ID of this document
     */
    id: string;
    /**
     * The username of the user
     */
    username: string;
    /**
     * The email of the user, if applicable
     */
    email: string;
    /**
     * The hash of the password of the user
     */
    password: string;
    /**
     * The flags that this user has
     */
    flags: string;
    /**
     * The ID of the settings document of this user
     */
    settings: string;
    /**
     * The date this document was created at
     */
    createdAt: Date;
    /**
     * The date this document was updated at
     */
    updatedAt: Date;
    /**
     * Create a session for this user
     */
    createSession(): Promise<ISessionDocument>;
    toJSON(options?: toJSONOptions): Record<string, unknown>;
}

const userSchema = new Schema({
    _id: {
        type: Schema.Types.String,
        default: () => snowflake()
    },
    username: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    flags: {
        type: Schema.Types.String,
        required: true,
        default: "0"
    },
    settings: {
        type: Schema.Types.String,
        unique: true,
        ref: "UserSettings"
    }
}, {
    timestamps: true
});

userSchema.statics.findByUsername = async function (username: string) {
    const user = await User.findOne({ username: { $regex: new RegExp(`^${escapeRegex(username)}$`, "i") } });

    if (!user) {
        return false;
    }

    return user;
};

userSchema.methods.createSession = async function () {
    const user = this as IUserDocument;

    const sessionOptions = {
        user: user.id
    };

    const session = new Session(sessionOptions);

    await session.save();

    return session;
};

userSchema.statics.findByCredentials = async function (username: string, password: string) {
    const user = await User.findByUsername(username);

    if (!user) {
        return false;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return false;
    }

    return user;
};

userSchema.methods.toJSON = function ({ isPublic = true } = {}) {
    const user = this as IUserDocument;

    if (!isPublic) {
        const newObject = {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt
        };

        if (!newObject.email) {
            delete newObject.email;
        }

        return newObject;
    } else {
        const newObject = {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt
        };

        return newObject;
    }
};

// User validation
userSchema.pre("validate", async function (next) {
    const document = this as IUserDocument;

    const errors = [];

    const username = document.username;
    const email = document.email;
    const password = document.password;

    const fieldErrors = new FieldError();

    if (!username) {
        fieldErrors.addError("username", "Username is required");
    }

    if (!email) {
        fieldErrors.addError("email", "Email is required");
    }

    if (!password) {
        fieldErrors.addError("password", "Password is required");
    }

    if (fieldErrors.hasErrors()) {
        return next(fieldErrors);
    }

    if (document.isModified("username")) {
        const userExists = !!(await User.findByUsername(username));

        if (userExists) {
            return next(new FieldError("username", "Username is already in use"));
        }

        const userValidation = config.getProperties().validation.user;

        if (username.length < userValidation.username.minlength || username.length > userValidation.username.maxlength) {
            fieldErrors.addError(
                "username",
                `Username must be between ${userValidation.username.minlength} and ${userValidation.username.maxlength} in length`
            );
        }

        if (!UsernameRegex.test(username)) {
            fieldErrors.addError("username", "Invalid characters found in username");
        }
    }

    if (document.isModified("email")) {
        const emailExists = await User.exists({ email });

        if (emailExists) {
            return next(new FieldError("email", "Email is already in use"));
        }

        // 89 is the longest that a valid email can be
        if (email.length > 89) {
            fieldErrors.addError("email", "Email can't be longer than 89 in length");
        }

        if (!validator.isEmail(email)) {
            fieldErrors.addError("email", "Invalid email");
        }
    }

    // The minimum password length required is 6 characters, because anything less is too insecure
    // The maximum password length is 72 characters, because that's the length bcrypt truncates at
    if (document.isModified("password")) {
        const score = scorePassword(document.password);

        if (password.length < 6 || password.length > 72) {
            fieldErrors.addError("password", "Password must be between 6 and 72 in length");
        } else if (score <= 30) {
            fieldErrors.addError("password", "Password is too weak");
        }
    }

    if (errors.length) {
        return next(fieldErrors);
    }

    next();
});

userSchema.pre("save", async function (next) {
    const document = this as IUserDocument;

    if (document.isModified("password")) {
        document.password = await bcrypt.hash(document.password, 10);
    }

    if (document.isNew || !document.settings) {
        const userSettings = new UserSettings({
            user: document.id
        });

        await userSettings.save();

        document.settings = userSettings.id;
    }


    next();
});

const User: IUserModel = mongoose.model<IUserDocument, IUserModel>("User", userSchema);

export default User;