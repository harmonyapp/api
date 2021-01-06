declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
             * The port that the express server will listen to
             */
            PORT: string;

            /**
             * The connection string for the MongoDB server
             */
            MONGODB_URI: string;

            /**
             * The worker ID.
             * <note>This will be set programmatically</note>
             */
            WORKER_ID?: string;

            /**
             * The data center ID.
             * <note>Defaults to 1</note>
             */
            DATA_CENTER_ID?: string;

            /**
             * The server ID, unique to each data center.
             * <note>Defaults to 1</note>
             */
            SERVER_ID?: string;

            /**
             * The environment in which the server is running
             */
            NODE_ENV: "development" | "production" | "test";

            /**
             * The amount of threads to spawn.
             * <note>Defaults to the amount of CPU cores</note>
             */
            THREAD_COUNT?: string;

            /**
             * Whether debug mode is enabled or not.
             * <note>Defaults to false</note>
             */
            DEBUG?: string;

            /**
             * The host of the redis server
             */
            REDIS_HOST: string;

            /**
             * The port of the redis server
             */
            REDIS_PORT: string;
        }
    }
}

export { };