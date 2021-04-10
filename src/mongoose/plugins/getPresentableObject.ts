import { Document, PresentableField, PresentableFieldKey, PresentableFieldValue, Query, Schema } from "mongoose";

const getPresentableObject = (schema: Schema): void => {
    let presentableFields: PresentableField = {};

    const getPopulateableFields = function () {
        const populateable = Object.keys(presentableFields).reduce((result, key) => {
            const value = presentableFields[key];

            if (typeof value === "object" && value.populate === true) {
                result.push(key);
            }

            return result;
        }, [] as string[]);

        return populateable;
    };

    schema.methods.getIncludibleFields = function () {
        const document = this as Document;

        const modifiedPresentableFields = { ...presentableFields };

        const includibleFields = [];

        if (document["$presentables"]) {
            Object.assign(modifiedPresentableFields, document["$presentables"]);
        }

        for (const field of Object.keys(modifiedPresentableFields)) {
            const presentableFieldValue = modifiedPresentableFields[field];

            if (typeof presentableFieldValue === "boolean" && presentableFieldValue === false) {
                continue;
            }

            if (typeof presentableFieldValue === "function") {
                const shouldPresent = (presentableFieldValue as () => boolean).call(document);

                if (!shouldPresent) {
                    continue;
                }
            }

            includibleFields.push(field);
        }

        return includibleFields;
    };

    schema.methods.getPresentableObject = function (): Record<string, unknown> {
        const document = this as Document;

        const documentData = document["$populated"] || document;
        const rawDocumentData = document["$raw"] || document;

        const newObject: Record<string, unknown> = {
            id: document.id
        };

        const includibleFields = document.getIncludibleFields();

        for (const field of includibleFields) {
            const newValue = documentData[field] || rawDocumentData[field];

            newObject[field] = newValue;
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

            const populateableFields = getPopulateableFields();

            doc["$raw"] = doc.toObject();
            doc["$populated"] = doc.toJSON();

            for (const field of populateableFields) {
                doc.depopulate(field);
            }
        }

        return next();
    });

    schema.pre(/find|findOne/, function (next) {
        const query = this as Query<unknown>;

        const populateableFields = getPopulateableFields();

        if (!query.getOptions()?.rawDocument) {
            query.populate(populateableFields.join(" "));
        }

        next();
    });

    schema.pre("save", async function (next) {
        const populateableFields = getPopulateableFields();

        this.populate(populateableFields.join(" "));

        await this.execPopulate();

        next();
    });

    schema.query.raw = function () {
        const query = this as Query<unknown>;

        query.setOptions({
            rawDocument: true
        });

        return query;
    };
};

export default getPresentableObject;