import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import getPresentableObject from "./plugins/getPresentableObject";
import wasNew from "./plugins/wasNew";

mongoose.plugin(getPresentableObject);
mongoose.plugin(wasNew);

const staging = process.env.NODE_ENV === "test";

const connectionOptions = {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    connectTimeoutMS: 3000
};

let mongoMemoryServer: MongoMemoryServer;

if (!staging) {
    mongoose.connect(process.env.MONGODB_URI, connectionOptions, (error) => {
        if (error) throw error;

        console.log("Connected to database");
    });
}

export const createStagingConnection = async function (): Promise<void> {
    mongoMemoryServer = new MongoMemoryServer();

    const mongoUri = await mongoMemoryServer.getUri();

    await mongoose.connect(mongoUri, connectionOptions);
};

// This will only have a value in staging.
// It will hold the mongo instance, since we don't want to talk to external servers during staging
export { mongoMemoryServer };