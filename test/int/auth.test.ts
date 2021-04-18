import chai from "chai";
import request from "supertest";
import app from "../../src/api";
import HttpStatusCode from "../../src/interfaces/HttpStatusCode";
import Session, { ISessionDocument } from "../../src/models/session";
import User, { IUserDocument } from "../../src/models/user";
import isValidAuthAttempt from "../validators/isValidAuthAttempt";
import isOwnAccount from "../validators/isOwnAccount";

describe("Authentication", function () {
    const username = "Eric";
    const email = "eric32@gmail.com";
    const password = "letmein";

    let token: string;
    let user: IUserDocument;

    describe("Registration", function () {
        it("doesn't authenticate without a valid token", async function () {
            this.slow(100);

            const response = await request(app)
                .get("/api/v1/users/@me");

            chai.expect(response.status).to.be.equal(HttpStatusCode.UNAUTHORIZED);

            const response2 = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", "Bearer invalid-token");

            chai.expect(response2.status).to.be.equal(HttpStatusCode.UNAUTHORIZED);

            const response3 = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", "Bot invalid-token");

            chai.expect(response3.status).to.be.equal(HttpStatusCode.UNAUTHORIZED);
        });

        it("creates an account", async function () {
            this.slow(1000);

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({ username, email, password });

            chai.expect(response.status).to.be.equal(HttpStatusCode.CREATED);

            chai.expect(response.body).to.haveOwnProperty("token");
            chai.expect(response.body).to.haveOwnProperty("user");

            chai.expect(response.body.user).to.haveOwnProperty("id");
            chai.expect(response.body.user).to.haveOwnProperty("username");
            chai.expect(response.body.user).to.haveOwnProperty("email");
            chai.expect(response.body.user).to.haveOwnProperty("flags");

            chai.expect(response.body.user.id).to.match(/^[0-9]{10,25}$/);

            chai.expect(response.body.user.username).to.be.equal(username);
            chai.expect(response.body.user.email).to.be.equal(email);
            chai.expect(response.body.user.flags).to.be.equal("0");

            token = response.body.token;
            user = await User.findOne({ _id: response.body.user.id });
        });

        it("successfully authenticates with newly created token", async function () {
            this.slow(100);

            const response = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", "Bearer " + token);

            chai.expect(response.status).to.be.equal(HttpStatusCode.OK);

            chai.expect(response.body).to.haveOwnProperty("user");

            chai.expect(response.body.user).to.haveOwnProperty("id");
            chai.expect(response.body.user).to.haveOwnProperty("username");
            chai.expect(response.body.user).to.haveOwnProperty("email");
            chai.expect(response.body.user).to.haveOwnProperty("flags");

            chai.expect(response.body.user.id).to.be.equal(user.id);
            chai.expect(response.body.user.username).to.be.equal(user.username);
            chai.expect(response.body.user.email).to.be.equal(user.email);
            chai.expect(response.body.user.flags).to.be.equal(user.flags);
        });
    });

    describe("Logging in", function () {
        it("does not log in with invalid credentials", async function () {
            this.slow(1200);

            // Invalid username and password
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    username: "nonexistent",
                    password: "someinvalidpwd"
                });

            // Valid username, but invalid password
            const response2 = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    username: username,
                    password: "someinvalidpwd"
                });

            for (const res of [response, response2]) {
                chai.expect(res.status).to.be.equal(HttpStatusCode.BAD_REQUEST);

                chai.expect(res.body).to.haveOwnProperty("error");

                chai.expect(res.body.error).to.be.equal("Wrong username or password");
            }
        });

        it("logs in with valid credentials", async function () {
            this.slow(1000);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ username, password });

            isValidAuthAttempt(response, user);
        });
    });

    describe("Logging out", function () {
        this.slow(200);

        before(async function () {
            this.sessions = await Session.insertMany([{ user: user.id }, { user: user.id }, { user: user.id }, { user: user.id }]);
        });

        it("logs out a single session", async function () {
            const sessions: ISessionDocument[] = this.sessions;

            // Logout for session 1
            const response = await request(app)
                .post("/api/v1/auth/logout")
                .set("Authorization", `Bearer ${sessions[0].token}`);

            chai.expect(response.status).to.be.equal(HttpStatusCode.NO_CONTENT);

            // Make sure session 1 was logged out and not session 2 and 3

            const response2 = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", `Bearer ${sessions[0].token}`);

            chai.expect(response2.status).to.be.equal(HttpStatusCode.UNAUTHORIZED);

            for (const session of [sessions[1], sessions[2], sessions[3]]) {
                const response3 = await request(app)
                    .get("/api/v1/users/@me")
                    .set("Authorization", `Bearer ${session.token}`);

                chai.expect(response3.status).to.be.equal(HttpStatusCode.OK);
            }
        });

        it("logs out all sessions", async function () {
            const sessions: ISessionDocument[] = this.sessions;

            const response = await request(app)
                .post("/api/v1/auth/logout?signOutAll")
                .set("Authorization", `Bearer ${sessions[1].token}`);

            chai.expect(response.status).to.be.equal(HttpStatusCode.NO_CONTENT);

            for (const session of [sessions[2], sessions[3]]) {
                const response2 = await request(app)
                    .get("/api/v1/users/@me")
                    .set("Authorization", `Bearer ${session.token}`);

                chai.expect(response2.status).to.be.equal(HttpStatusCode.UNAUTHORIZED);
            }
        });
    });

    describe("Authentication validation", function () {
        it("doesn't access restricted endpoint without authentication", async function () {
            // A token is provided, but it has no valid prefix and the rest of the token is invalid
            const response1 = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", "completely invalid token");

            // A token is provided, and it has a valid prefix, but the token is not valid
            const response2 = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", "Bearer valid-prefix-but-invalid-token");

            // No token and no header is provided at all
            const response3 = await request(app)
                .get("/api/v1/users/@me");

            const responses = [response1, response2, response3];

            for (const response of responses) {
                chai.expect(response.status).to.be.equal(HttpStatusCode.UNAUTHORIZED);
            }
        });

        it("does access a restricted endpoint with valid authentication", async function () {
            const session = new Session({ user: user.id });

            await session.save();

            const response = await request(app)
                .get("/api/v1/users/@me")
                .set("Authorization", "Bearer " + session.token);

            isOwnAccount(response, user);
        });
    });
});