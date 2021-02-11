const isNumeric = (input: string | number): boolean => {
    if (typeof input === "number") return true;

    return !Number.isNaN(Number(input));
};

export default isNumeric;