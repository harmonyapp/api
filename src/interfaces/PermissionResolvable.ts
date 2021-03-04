import BitFieldResolvable from "./BitFieldResolvable";
import PermissionString from "./PermissionString";

type PermissionResolvable = PermissionString | BitFieldResolvable;

export default PermissionResolvable;