const debug = (message?: unknown, ...optionalParams: unknown[]): void => {
    if (process.env.NODE_ENV !== "production") {
        console.log("[DEBUG]", message, ...optionalParams);
    }
};

export default debug;