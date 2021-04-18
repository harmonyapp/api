import chai from "chai";
import request from "supertest";
import app from "../../src/api";
import HttpStatusCode from "../../src/interfaces/HttpStatusCode";
import { dembe_session, user_raymond } from "../fixtures/db";
import isUser from "../validators/isUser";

describe("Users", function () {
    describe("Fetching your own account", function () {
        it("fetches your own account", async function () {
            const response = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", "Bearer " + dembe_session.token);

            chai.expect(response.status).to.be.equal(HttpStatusCode.OK);

            chai.expect(response.body).to.haveOwnProperty("user");

            isUser(response.body.user, { self: true });
        });
    });

    describe("Fetching someone else's account", function () {
        it("does not fetch an unknown account", async function () {
            const response = await request(app)
                .get("/api/v1/users/randomInvalidID")
                .set("Authorization", "Bearer " + dembe_session.token);

            chai.expect(response.status).to.be.equal(HttpStatusCode.NOT_FOUND);
        });

        it("does fetch a valid account", async function () {
            const response = await request(app)
                .get("/api/v1/users/" + user_raymond.id)
                .set("Authorization", "Bearer " + dembe_session.token);

            chai.expect(response.status).to.be.equal(HttpStatusCode.OK);

            chai.expect(response.body).to.haveOwnProperty("user");

            isUser(response.body.user, { self: false });
        });
    });
});