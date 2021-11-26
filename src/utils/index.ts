export function numberize(obj: Record<string, number | string>) {
    for (const key in obj) {
        const element = obj[key];
        if (typeof element === "string") {
            obj[key] = +element || 0;
        }
    }
    return obj;
}
