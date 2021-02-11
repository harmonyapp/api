import { Document, PresentableField, Schema } from "mongoose";
import getPresentableFields from "../../helpers/getPresentableFields";

const getPresentableObject = (schema: Schema): void => {
    const presentableFields: PresentableField<null>[] = [];

    schema.statics.addPresentableFields = function (fields: PresentableField<null>): void {
        Object.assign(presentableFields, fields);
    };

    schema.methods.getPopulateableFields = function () {
        const populateable = Object.keys(presentableFields).reduce((result, key) => {
            const value = presentableFields[key];

            if (typeof value !== "boolean" && value.populate === true) {
                result.push(key);
            }

            return result;
        }, [] as string[]);

        return populateable;
    };

    schema.methods.getPresentableFields = function () {
        return presentableFields;
    };

    schema.methods.getPresentableObject = function (): Record<string, unknown> {
        const document = this as Document;

        const returnValue = getPresentableFields(document, presentableFields);

        return returnValue;
    };

    schema.methods.toJSON = function (): Record<string, unknown> {
        return schema.methods.getPresentableObject.call(this);
    };

    schema.statics.setPresentableFields = function (fields: PresentableField<null>): void {
        const document = this as Document;

        return document.addPresentableFields(fields);
    };

    schema.post(/find*|save/, async function (docs: Document[] | Document, next) {
        if (!Array.isArray(docs) && !docs) return next();

        docs = Array.isArray(docs) ? docs : [docs];

        for (const doc of docs) {
            for (const field of doc.getPopulateableFields()) {
                doc.populate(field);
            }

            await doc.execPopulate();
        }

        return next();
    });
};

export default getPresentableObject;