import BitfieldResolvable from "../interfaces/BitFieldResolvable";
import Bitfield from "./BitField";
import { PermissionFlags } from "./Constants";

class Permissions extends Bitfield {
    constructor(bits: BitfieldResolvable) {
        super(bits);

        this.FLAGS = PermissionFlags;
    }
}

export default Permissions;