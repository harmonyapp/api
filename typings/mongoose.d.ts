declare module "mongoose" {
    export type PresentableField = Record<string, boolean | {
        populate: boolean;
        yield?: string;
    }>;

    interface Document {
        getPresentableObject(): Promise<Record<string, unknown>>;
        addPresentableFields(fields: PresentableField): void;
        getPopulateableFields(): string[];
    }

    interface Model<T extends Document, QueryHelpers = {}> {
        setPresentableFields(fields: PresentableField): void;
    }
}