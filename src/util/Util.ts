class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }
}

export default Util;