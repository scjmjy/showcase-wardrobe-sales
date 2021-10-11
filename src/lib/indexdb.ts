import localforage from "localforage";
import { IIndexDb, Nullable } from "./indexdb.api";
import { Resource } from "./model/resource";

export type DBValue = {
    utime: string;
    file: File;
};

export class IndexDb implements IIndexDb {
    async cache(resources: Array<Resource>): Promise<void> {
        for (const resource of resources) {
            const key = resource.name;
            const ut = resource.utime;

            const value: Nullable<DBValue>  = await localforage.getItem(key);
            if (value == null || value.file == null || value.utime != ut) {
                const data = this.retry(async () => {
                    return await (await fetch(resource.url)).blob();
                }, 3);

                if (data == null) {
                    continue;
                }

                await localforage.setItem(key, { utime: ut, file: await data });
            }
        }
    }

    async get<DBValue>(key: string): Promise<Nullable<DBValue>> {
        return await localforage.getItem(key);
    }

    private retry<T>(func: () => T, times: number): Nullable<T> {
        try {
            return func();
        } catch {
            if (times > 0) {
                return this.retry(func, times--);
            } else {
                return null;
            }
        }
    }
}
