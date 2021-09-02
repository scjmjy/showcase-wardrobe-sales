export function splitPrice(price: number, digits = 2) {
    const s = price.toFixed(2).split(".", digits);
    return {
        integer: s[0],
        decimal: s[1],
    };
}
