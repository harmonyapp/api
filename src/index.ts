import dotenv from "dotenv";

dotenv.config();

import "./mongoose/db";

import chalk from "chalk";
import cluster from "cluster";
import { createServer } from "http";
import { cpus } from "os";
import { initialize } from "./socket/instance";

import app from "./api";

const server = createServer(app);

initialize(server);

const PORT = process.env.PORT;

const log = console.log.bind({});

console.log = function (...args) {
    let initiator = "unknown place";

    try {
        throw new Error();
    } catch (e) {
        if (typeof e.stack === "string") {
            let isFirst = true;

            for (const line of e.stack.split("\n")) {
                const matches = line.match(/^\s+at\s+(.*)/);

                if (matches) {
                    if (!isFirst) { // first line - current function
                        // second line - caller (what we are looking for)
                        initiator = matches[1];
                        break;
                    }

                    isFirst = false;
                }
            }
        }
    }

    if (cluster.isMaster) {
        log("[Master]", ...args, "\n", chalk.green(`  at ${initiator}\n`));
    } else {
        log(`[Worker ${process.env.WORKER_ID}]`, ...args, "\n", chalk.green(`  at ${initiator}\n`));
    }
};

const cpuCount = process.env.THREAD_COUNT ? parseInt(process.env.THREAD_COUNT) : cpus().length;

if (cluster.isMaster) {
    cluster.on("online", (worker) => {
        console.log(`Worker ${worker.id} started`);
    });

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.id} died. Code: ${code}, signal: ${signal}`);

        cluster.fork({
            ...process.env,
            WORKER_ID: worker.id
        });
    });

    for (let i = 0; i < cpuCount; i++) {
        cluster.fork({
            ...process.env,
            WORKER_ID: i + 1
        });
    }
} else {
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}