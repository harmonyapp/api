import isNumeric from "../helpers/isNumeric";
import BitFieldResolvable from "../interfaces/BitFieldResolvable";

class BitField {
    public FLAGS: object = {};

    public readonly bits: number;

    constructor(bits: BitFieldResolvable) {
        this.bits = this.resolve(bits);
    }

    public some(bits: BitFieldResolvable[]): boolean {
        return bits.some((b) => this.has(b));
    }

    public has(bit: BitFieldResolvable | BitFieldResolvable[]): boolean {
        if (Array.isArray(bit)) return bit.every((b) => this.has(b));

        bit = this.resolve(bit);

        return (this.bits & bit) === bit;
    }

    public resolve(resolvable: BitFieldResolvable): number {
        if (typeof resolvable === "number") return resolvable;
        if (isNumeric(resolvable)) return +resolvable;
        if (typeof this.FLAGS[resolvable] !== "undefined") return this.FLAGS[resolvable];

        throw new Error("Invalid value passed to resolve: " + resolvable);
    }
}

export default BitField;