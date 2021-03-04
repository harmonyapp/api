import chai from "chai";
import BitField from "../../src/util/BitField";

describe("BitField", function () {
    describe("#has", function () {
        const bitfield = new BitField(0x01 | 0x02 | 0x08);

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

    describe("#some", function () {
        const bitfield = new BitField(0x01 | 0x04);

        it("returns true when at least one of the provided bits exist in the bitfield", function () {
            chai.expect(bitfield.some([0x01, 0x08])).to.be.true;
            chai.expect(bitfield.some([0x01, 0x04])).to.be.true;
        });

        it("returns false when none of the provided bits exist in the bitfield", function () {
            chai.expect(bitfield.some([0x02, 0x08])).to.be.false;
            chai.expect(bitfield.some([0x02, 0x80])).to.be.false;
        });
    });
});