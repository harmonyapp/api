import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import getPresentableObject from "./plugins/getPresentableObject";

const staging = process.env.NODE_ENV === "test";

const connectionOptions = {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    connectTimeoutMS: 3000
};

let mongoMemoryServer: MongoMemoryServer;

if (staging) {
    mongoMemoryServer = new MongoMemoryServer();

    mongoMemoryServer.getUri().then((mongoUri) => {
        mongoose.connect(mongoUri, connectionOptions, (error) => {
            if (error) throw error;

            console.log("Connected to database");
        });
    });
} else {
    mongoose.connect(process.env.MONGODB_URI, connectionOptions, (error) => {
        if (error) throw error;

        console.log("Connected to database");
    });
}

mongoose.plugin(getPresentableObject);

// This will only have a value in staging.
// It will hold the mongo instance, since we don't want to talk to external servers during staging
export { mongoMemoryServer };