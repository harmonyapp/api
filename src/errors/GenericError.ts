import BaseError from "./BaseError";

class GenericError extends BaseError {
    public error: string;

    get message() {
        return this.error;
    }

    constructor(error: string) {
        super();

        this.error = error;
    }

    public setError(error: string) {
        this.error = error;
    }

    public compile() {
        return this.error;
    }
}

export default GenericError;