import config from "../../config/config";
import validator from "validator";
import bcrypt from "bcryptjs";
import mongoose, { Schema, Model, Document } from "mongoose";
import snowflake from "../helpers/snowflake";
import escapeRegex from "../helpers/escapeRegex";
import Session, { ISessionDocument } from "./session";
import FieldError from "../errors/FieldError";
import { UsernameRegex } from "../util/Constants";

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

userSchema.methods.createSession = async function (this: IUserDocument) {
    const sessionOptions = {
        user: this.id
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

// User validation
userSchema.pre<IUserDocument>("validate", async function (next) {
    const username = this.username;
    const email = this.email?.toLowerCase();
    const password = this.password;

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

    if (this.isModified("username")) {
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

    if (this.isModified("email")) {
        const emailExists = await User.exists({ email });

        if (emailExists) {
            return next(new FieldError("email", "Email is already in use"));
        }

        if (!validator.isEmail(email)) {
            fieldErrors.addError("email", "Invalid email");
        }
    }

    // The minimum password length required is 6 characters, because anything less is too insecure
    // The maximum password length is 72 characters, because that's the length bcrypt truncates at
    if (this.isModified("password")) {
        if (password.length < 6 || password.length > 72) {
            fieldErrors.addError("password", "Password must be between 6 and 72 in length");
        }
    }

    if (fieldErrors.hasErrors()) {
        return next(fieldErrors);
    }

    next();
});

userSchema.pre<IUserDocument>("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    next();
});

const User: IUserModel = mongoose.model<IUserDocument, IUserModel>("User", userSchema);

User.setPresentableFields({
    username: true,
    email: false,
    flags: true
});

export default User;