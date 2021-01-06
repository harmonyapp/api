const _random = (length, charset): string => {
    const items = [];

    for (let i = 0; i < length; i++) {
        items.push(charset[Math.floor(Math.random() * charset.length)]);
    }

    return items.join("");
};

export const string = (length: number): string => {
    return _random(length, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890");
};

export const number = (length: number): string => {
    return _random(length, "1234567890");
};

const random = {
    string,
    number
};

export default random;