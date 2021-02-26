import chai from "chai";
import request from "supertest";
import app from "../../src/api";
import HttpStatusCode from "../../src/interfaces/HttpStatusCode";

describe("Authentication", function () {
    describe("Registration", function () {
        const username = "Eric";
        const email = "eric32@gmail.com";
        const password = "letmein";

        let token: string;
        let user: {
            id: string;
            username: string;
            email: string;
            flags: string;
        };

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
            user = response.body.user;
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
});