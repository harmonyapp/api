process.env.NODE_ENV = "test";

import mongoose from "mongoose";
import { createStagingConnection, mongoMemoryServer } from "../../src/mongoose/db";
import { setupDatabase } from "./db";

import { createServer } from "http";

import { getIOInstance, initialize } from "../../src/socket/instance";

import app from "../../src/api";

export async function mochaGlobalSetup(): Promise<void> {
    this.server = createServer(app);

    mongoose.connection.on("connected", function () {
        console.log("Connected to staging db");
    });

    await createStagingConnection();

    await setupDatabase();

    initialize(this.server);

    console.log = () => { return; };
}

export async function mochaGlobalTeardown(): Promise<void> {
    const IOInstance = getIOInstance();

    await mongoose.disconnect();

    mongoMemoryServer.stop();
    this.server.close();

    IOInstance.close();
}