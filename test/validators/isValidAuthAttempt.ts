import chai from "chai";
import { Response } from "supertest";
import HttpStatusCode from "../../src/interfaces/HttpStatusCode";
import { IUserDocument } from "../../src/models/user";

export default function isValidAuthAttempt(response: Response, user: IUserDocument): void {
    chai.expect(response.status).to.be.equal(HttpStatusCode.OK);

    chai.expect(response.body).to.haveOwnProperty("token");
    chai.expect(response.body).to.haveOwnProperty("user");

    chai.expect(response.body.token).to.be.a("string");

    chai.expect(response.body.user).to.haveOwnProperty("id");
    chai.expect(response.body.user).to.haveOwnProperty("username");
    chai.expect(response.body.user).to.haveOwnProperty("email");
    chai.expect(response.body.user).to.haveOwnProperty("flags");

    chai.expect(response.body.user.id).to.be.equal(user.id);
    chai.expect(response.body.user.username).to.be.equal(user.username);
    chai.expect(response.body.user.email).to.be.equal(user.email);
    chai.expect(response.body.user.flags).to.be.equal(user.flags);
}