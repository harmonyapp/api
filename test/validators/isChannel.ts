import chai from "chai";
import isServer from "./isServer";
import isSnowflake from "./isSnowflake";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function isChannel(data: Record<string, any>): void {
    chai.expect(data).to.haveOwnProperty("id");
    chai.expect(data).to.haveOwnProperty("name");
    chai.expect(data).to.haveOwnProperty("server");
    chai.expect(data).to.haveOwnProperty("type");
    chai.expect(data).to.haveOwnProperty("position");

    isSnowflake(data.id);
    isServer(data.server);

    chai.expect(data.name).to.be.a("string");
    chai.expect(data.type).to.be.a("number");
    chai.expect(data.position).to.be.a("number");
}