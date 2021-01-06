const escapeRegex = (string: string): string => {
    // eslint-disable-next-line no-useless-escape
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

export default escapeRegex;