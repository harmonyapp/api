import intformat from "biguint-format";
import FlakeId from "flake-idgen";

const options = {
    datacenter: +process.env.DATA_CENTER_ID || 0,
    worker: +process.env.WORKER_ID || 0,
    id: +process.env.SERVER_ID || 0,
    epoch: 1609459200000
};

const flakeId = new FlakeId(options);

const snowflake = (): string => {
    return intformat(flakeId.next(), "dec");
};

export default snowflake;