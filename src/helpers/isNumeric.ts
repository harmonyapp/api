const isNumeric = (input: string | number) => {
    if (typeof input === "number") return true;

    return !Number.isNaN(Number(input));
}

export default isNumeric;