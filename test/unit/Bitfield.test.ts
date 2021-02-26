import chai from "chai";
import BitField from "../../src/util/BitField";

describe("BitField", function () {
    const bitfield = new BitField(0x01 | 0x02 | 0x08);

    describe("#has", function () {
        it("returns true when the bitfield has the supplied bits", function () {
            chai.expect(bitfield.has(0x01)).to.be.true;
            chai.expect(bitfield.has(0x02)).to.be.true;
            chai.expect(bitfield.has(0x08)).to.be.true;
        });

        it("returns false when the bitfield does not have the supplied bits", function () {
            chai.expect(bitfield.has(0x04)).to.be.false;
            chai.expect(bitfield.has(0x012)).to.be.false;
            chai.expect(bitfield.has(0x014)).to.be.false;
        });
    });
});