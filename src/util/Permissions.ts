import BitFieldResolvable from "../interfaces/BitFieldResolvable";
import BitField from "./BitField";
import { PermissionFlags } from "./Constants";

class Permissions extends BitField {
    constructor(bits: BitFieldResolvable) {
        super(bits);

        this.FLAGS = PermissionFlags;
    }
}

export default Permissions;