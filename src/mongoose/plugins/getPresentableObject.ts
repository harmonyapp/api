import { Document, PresentableField, PresentableFieldKey, PresentableFieldValue, Schema } from "mongoose";

const getPresentableObject = (schema: Schema): void => {
    let presentableFields: PresentableField = {};

    schema.methods.getPopulateableFields = function () {
        const populateable = Object.keys(presentableFields).reduce((result, key) => {
            const value = presentableFields[key];

            if (typeof value === "object" && value.populate === true) {
                result.push(key);
            }

            return result;
        }, [] as string[]);

        return populateable;
    };

    schema.methods.getPresentableObject = function (options: Record<string, unknown> = {}): Record<string, unknown> {
        const document = this as Document;

        const newObject: Record<string, unknown> = {
            id: document.id
        };

        const modifiedPresentableFields = { ...presentableFields };

        if (document["$presentables"]) {
            Object.assign(modifiedPresentableFields, document["$presentables"]);
        }

        for (const field of Object.keys(modifiedPresentableFields)) {
            const presentableFieldValue = modifiedPresentableFields[field];

            if (typeof presentableFieldValue === "boolean" && presentableFieldValue === false) {
                continue;
            }

            if (typeof presentableFieldValue === "function") {
                const value = presentableFieldValue(options);

                if (value === false) {
                    continue;
                }
            }

            newObject[field] = document[field];
        }

        // These properties are *always* hidden, regardless of configuration, since they are never of any use to the client
        const hiddenProperties = ["_id", "__v"];

        for (const prop of hiddenProperties) {
            if (Object.keys(newObject).indexOf(prop) !== -1) {
                delete newObject[prop];
            }
        }

        return newObject;
    };

    // For some reason, Javascript appears to be providing the variable name as the first argument of toJSON when called implicitly
    schema.methods.toJSON = function (): Record<string, unknown> {
        return schema.methods.getPresentableObject.call(this);
    };

    schema.methods.setPresentableField = function (field: PresentableFieldKey, key: PresentableFieldValue) {
        const document = this as Document;

        document["$presentables"] = {
            ...presentableFields,
            [field]: key
        };
    };

    schema.methods.setPresentableFields = function (fields: PresentableField) {
        const document = this as Document;

        Object.keys(fields).forEach((field) => {
            document.setPresentableField(field, fields[field]);
        });

        return this;
    };

    schema.statics.setPresentableFields = function (fields: PresentableField): void {
        presentableFields = fields;
    };

    schema.post(/find*|save/, async function (docs: Document[] | Document, next) {
        if (!Array.isArray(docs) && !docs) return next();

        docs = Array.isArray(docs) ? docs : [docs];

        for (const doc of docs) {
            if (!(doc instanceof Document)) continue;

            for (const field of doc.getPopulateableFields()) {
                doc.populate(field);
            }

            await doc.execPopulate();
        }

        return next();
    });
};

export default getPresentableObject;