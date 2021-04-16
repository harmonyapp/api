import { Schema } from "mongoose";

// In a post-save hook, Document#isNew is always false, even if the document is new.
// This plugin adds a new property called wasNew, which will reflect whether the document actually is new or not in the post-hook

const wasNew = (schema: Schema): void => {
    schema.pre("save", function (next) {
        this.wasNew = this.isNew;

        next();
    });
};

export default wasNew;