declare module "mongoose" {
    type PartialRecord<K extends keyof any, T> = {
        [P in K]?: T;
    }

    export type PresentableFieldKey<T = any> = keyof { [P in keyof Omit<T, keyof Document>] };
    export type PresentableFieldValue = boolean | {
        populate: boolean;
        yield?: string;
    };

    export type PresentableField<T = null> = PartialRecord<PresentableFieldKey<T>, PresentableFieldValue>;

    interface Document {
        getPresentableObject(): Record<string, unknown>;
        getPopulateableFields(): string[];
        setPresentableField(key: PresentableFieldKey<this> | string, value: PresentableFieldValue): Document;
        setPresentableFields(fields: PresentableField<this>): Document;
    }

    interface Model<T extends Document, QueryHelpers = {}> {
        setPresentableFields(fields: PresentableField<T>): void;
    }
}