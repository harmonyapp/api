import chai from "chai";
import isSnowflake from "./isSnowflake";
import isUser from "./isUser";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function isServer(data: Record<string, any>): void {
    chai.expect(data).to.haveOwnProperty("id");
    chai.expect(data).to.haveOwnProperty("name");
    chai.expect(data).to.haveOwnProperty("owner");

    isSnowflake(data.id);

    chai.expect(data.name).to.be.a("string");

    isUser(data.owner, { self: false });
}