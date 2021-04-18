import chai from "chai";
import isNumeric from "../../src/helpers/isNumeric";
import isSnowflake from "./isSnowflake";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function isUser(data: Record<string, any>, { self }: { self: boolean }): void {
    chai.expect(data).to.haveOwnProperty("id");
    chai.expect(data).to.haveOwnProperty("username");
    chai.expect(data).to.haveOwnProperty("flags");

    isSnowflake(data.id);

    chai.expect(data.username).to.be.a("string");
    chai.expect(data.flags).to.be.a("string");
    chai.expect(isNumeric(data.flags)).to.be.true;

    if (self) {
        chai.expect(data.email).to.be.a("string");
    } else {
        chai.expect(data.email).to.be.undefined;
    }
}