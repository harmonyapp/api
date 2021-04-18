import chai from "chai";

export default function isSnowflake(snowflake: string): void {
    chai.expect(snowflake).to.match(/[0-9]+/);
}