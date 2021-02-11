import { Document, PresentableField } from "mongoose";

const getPresentableFields = (document: Document, presentableFields: PresentableField<null>[]) => {
    const newObject: Record<string, unknown> = {
        id: document.id
    };

    for (const field of Object.keys(presentableFields)) {
        newObject[field] = document[field];
    }

    // These properties are *always* hidden, regardless of configuration, since they are never of any use to the client
    const hiddenProperties = ["_id", "__v"];

    for (const prop of hiddenProperties) {
        if (newObject.hasOwnProperty(prop)) {
            delete newObject[prop];
        }
    }

    return newObject;
}

export default getPresentableFields;