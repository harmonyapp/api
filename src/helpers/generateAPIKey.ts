import crypto from "crypto";

const generateAPIKey = function (): string {
    const prefix = crypto.randomBytes(24).toString("base64");
    const bytes = crypto.randomBytes(36).toString("base64");

    const token = [prefix, bytes].join(".");

    return token;
};

export default generateAPIKey;