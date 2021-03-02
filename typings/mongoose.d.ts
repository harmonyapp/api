declare module "mongoose" {
    type PartialRecord<K extends keyof any, T> = {
        [P in K]?: T;
    }

    export type PresentableFieldKey<T = any> = keyof { [P in keyof Omit<T, keyof Document>] };
    export type PresentableFieldValue = boolean | {
        populate: boolean;
        yield?: string;
    } | ((...options: unknown[]) => boolean);

    export type PresentableField<T = null> = PartialRecord<PresentableFieldKey<T>, PresentableFieldValue>;

    interface Document {
        /**
         * Returns the presentable object, populated and cleaned up, ready to be sent to the client
         */
        getPresentableObject(): Record<string, unknown>;
        /**
         * Returns all fields that are subject to being populated, if any
         */
        getPopulateableFields(): string[];
        /**
         * Configure a single presentable field.
         * <note>This applies only to the single document it's run on</note>
         */
        setPresentableField(key: PresentableFieldKey<this> | string, value: PresentableFieldValue): Document;
        /**
         * Configure the presentable fields for the document.
         * <note>This only overwrites the fields that were provided, the others remain intact.</note>
         * <note>This applies only to the single document it's run on</note>
         */
        setPresentableFields(fields: PresentableField<this>): Document;
    }

    interface Model<T extends Document, QueryHelpers = {}> {
        /**
         * Configure the presentable fields for this model
         */
        setPresentableFields(fields: PresentableField<T>): void;
    }
}