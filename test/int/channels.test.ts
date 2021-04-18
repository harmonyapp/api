import chai from "chai";
import request from "supertest";
import app from "../../src/api";
import HttpStatusCode from "../../src/interfaces/HttpStatusCode";
import isChannel from "../validators/isChannel";
import { dembes_server, dembe_session } from "../fixtures/db";

describe("Channels", function () {
    describe("Creating a server channel", function () {
        it("creates a channel", async function () {
            this.slow(250);

            const response = await request(app)
                .post("/api/v1/servers/" + dembes_server.id + "/channels")
                .set("Authorization", "Bearer " + dembe_session.token)
                .send({
                    type: 1,
                    name: "memes"
                });

            chai.expect(response.status).to.be.equal(HttpStatusCode.CREATED);
            chai.expect(response.body).to.haveOwnProperty("channel");

            isChannel(response.body.channel);
        });
    });
});