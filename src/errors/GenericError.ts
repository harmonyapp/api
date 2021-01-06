import BaseError from "./BaseError";

class GenericError extends BaseError {
    public error: string;

    get message(): string {
        return this.error;
    }

    constructor(error: string) {
        super();

        this.error = error;
    }

    public setError(error: string): void {
        this.error = error;
    }

    public compile(): string {
        return this.error;
    }
}

export default GenericError;