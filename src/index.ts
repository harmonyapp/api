import dotenv from "dotenv";

dotenv.config();

import "./mongoose/db";

import { createServer } from "http";
import { initialize } from "./socket/instance";

import app from "./api";

const server = createServer(app);

initialize(server);

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});