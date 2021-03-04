const debug = (message?: unknown, ...optionalParams: unknown[]): void => {
    if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG]", message, ...optionalParams);
    }
};

export default debug;