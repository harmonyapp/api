import chai from "chai";
import request from "supertest";
import app from "../../src/api";
import HttpStatusCode from "../../src/interfaces/HttpStatusCode";
import Channel from "../../src/models/channel";
import Invite from "../../src/models/invite";
import isServer from "../validators/isServer";
import { dembe_session, raymond_session, user_raymond } from "../fixtures/db";
import { IServerDocument } from "../../src/models/server";
import { ChannelTypes } from "../../src/util/Constants";
import isChannel from "../validators/isChannel";

describe("Servers", function () {
    let raymonds_temp_server: IServerDocument;

    describe("Creating a server", function () {
        it("successfully creates a server", async function () {
            this.slow(150);

            const response = await request(app)
                .post("/servers")
                .set("Authorization", "Bearer " + raymond_session.token)
                .send({
                    name: "Raymond's Server"
                });

            chai.expect(response.status).to.be.equal(HttpStatusCode.CREATED);

            chai.expect(response.body).to.haveOwnProperty("server");

            isServer(response.body.server);

            raymonds_temp_server = response.body.server;
        });

        it("created the default channels", async function () {
            this.slow(150);

            const response = await request(app)
                .get("/servers/" + raymonds_temp_server.id + "/channels")
                .set("Authorization", "Bearer " + raymond_session.token);

            chai.expect(response.status).to.be.equal(HttpStatusCode.OK);
            chai.expect(response.body).to.haveOwnProperty("channels");

            chai.expect(response.body.channels).to.be.an("array");
            chai.expect(response.body.channels).to.be.of.length(2);

            for (const channel of response.body.channels) {
                isChannel(channel);
            }
        });
    });

    describe("Joining a server", function () {
        it("successfully joins a server", async function () {
            this.slow(250);

            const inviteChannel = await Channel.findOne({ server: raymonds_temp_server.id, type: ChannelTypes.SERVER_TEXT });

            const invite = new Invite({
                user: user_raymond.id,
                server: raymonds_temp_server.id,
                channel: inviteChannel.id
            });

            await invite.save();

            const response = await request(app)
                .post("/invites/" + invite.code)
                .set("Authorization", "Bearer " + dembe_session.token)
                .send({
                    name: "Raymond's Server"
                });

            chai.expect(response.status).to.be.equal(HttpStatusCode.CREATED);

            const response2 = await request(app)
                .get("/servers")
                .set("Authorization", "Bearer " + dembe_session.token);

            chai.expect(response2.status).to.be.equal(HttpStatusCode.OK);
            chai.expect(response2.body).to.haveOwnProperty("servers");

            chai.expect(response2.body.servers).to.have.lengthOf(2);

            for (const server of response2.body.servers) {
                isServer(server);
            }
        });
    });

    describe("Deleting a server", function () {
        it("does not delete the server", async function () {
            this.slow(250);

            const response = await request(app)
                .delete("/servers/" + raymonds_temp_server.id)
                .set("Authorization", "Bearer " + dembe_session.token);

            chai.expect(response.status).to.be.equal(HttpStatusCode.FORBIDDEN);

            const response2 = await request(app)
                .get("/servers/" + raymonds_temp_server.id)
                .set("Authorization", "Bearer " + dembe_session.token);

            chai.expect(response2.body).to.haveOwnProperty("server");

            isServer(response2.body.server);
        });

        it("successfully deletes the server", async function () {
            this.slow(250);

            const response = await request(app)
                .delete("/servers/" + raymonds_temp_server.id)
                .set("Authorization", "Bearer " + raymond_session.token);

            chai.expect(response.status).to.be.equal(HttpStatusCode.OK);

            chai.expect(response.body).to.haveOwnProperty("success");
            chai.expect(response.body).to.haveOwnProperty("message");

            chai.expect(response.body.success).to.be.true;
        });
    });
});