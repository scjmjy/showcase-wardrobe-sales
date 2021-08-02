import dayjs from "dayjs";

export function formatPlain(date: dayjs.Dayjs | Date) {
    const d = date instanceof Date ? dayjs(date) : date;
    return d.format("YYYYMMDDHHmmss");
}
