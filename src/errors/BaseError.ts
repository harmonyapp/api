import HttpStatusCode from "../interfaces/HttpStatusCode";

class BaseError extends Error {
    public httpStatusCode: HttpStatusCode = HttpStatusCode.BAD_REQUEST;

    public compile(): { [key: string]: unknown; }[] | string {
        throw new Error("No compiler provided for error.");
    }

    public setHttpStatusCode(httpStatusCode: HttpStatusCode): this {
        this.httpStatusCode = httpStatusCode;

        return this;
    }
}

export default BaseError;