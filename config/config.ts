import convict from "convict";

// Do not change this unless you know what you're doing.
// If you want to configure the server, go into either production.json or development.json, depending on your environment
const config = convict({
    env: {
        doc: "The environment in which the server is running.",
        format: ["production", "development", "test"],
        default: "development",
        env: "NODE_ENV"
    },
    maxServers: {
        doc: "The maximum amount of servers a user can create and/or join.",
        format: "nat",
        default: 100
    },
    validation: {
        user: {
            doc: "User validation",
            username: {
                doc: "Username",
                minlength: {
                    format: "nat",
                    default: 3
                },
                maxlength: {
                    format: "nat",
                    default: 16
                }
            }
        },
        server: {
            doc: "Server validation",
            name: {
                doc: "Name",
                minlength: {
                    format: "nat",
                    default: 1
                },
                maxlength: {
                    format: "nat",
                    default: 20
                }
            }
        },
        channel: {
            doc: "Channel verification",
            name: {
                doc: "Name",
                minlength: {
                    format: "nat",
                    default: 1
                },
                maxlength: {
                    format: "nat",
                    default: 24
                }
            },
            topic: {
                doc: "Topic",
                minlength: {
                    format: "nat",
                    default: 1,
                },
                maxlength: {
                    format: "nat",
                    default: 250
                }
            }
        },
        message: {
            doc: "Message",
            content: {
                minlength: {
                    format: "nat",
                    default: 1,
                },
                maxlength: {
                    format: "nat",
                    default: 2000
                }
            }
        }
    }
});

const env = config.get("env");

config.loadFile("./config/" + env + ".json");

export default config;