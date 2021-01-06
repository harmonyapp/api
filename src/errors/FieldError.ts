import BaseError from "./BaseError";

class FieldError extends BaseError {
    public errors: { field: string, error: string }[] = [];

    constructor(field?: string, error?: string) {
        super();

        if (field && error) {
            this.addError(field, error);
        }
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public addError(field: string, error: string, overwrite = false): void {
        const existing = this.errors.find((error) => error.field === field);

        if (existing) {
            if (overwrite) existing.error = error;
        } else {
            this.errors.push({ field, error });
        }
    }

    public compile(): { field: string, error: string }[] {
        return this.errors;
    }
}

export default FieldError;