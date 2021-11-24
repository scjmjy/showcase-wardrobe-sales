export function splitPrice(price: number, digits = 2) {
    const s = price.toFixed(digits).split(".");
    return {
        integer: s[0],
        decimal: s[1],
    };
}
