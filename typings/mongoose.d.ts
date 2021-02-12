declare module "mongoose" {
    export type PresentableField<T> = { [P in keyof Omit<T, keyof Document>]?: boolean | {
        populate: boolean;
        yield?: string;
    } };

    interface Document {
        getPresentableObject(): Promise<Record<string, unknown>>;
        getPopulateableFields(): string[];
    }

    interface Model<T extends Document, QueryHelpers = {}> {
        setPresentableFields(fields: PresentableField<T>): void;
    }
}