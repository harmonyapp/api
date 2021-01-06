class Permission {
    private permission: number;

    constructor(permission: number) {
        this.permission = permission;
    }

    public has(permission: number): boolean {
        return (this.permission & permission) === permission;
    }
}

export default Permission;