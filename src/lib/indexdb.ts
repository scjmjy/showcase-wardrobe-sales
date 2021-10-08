import localforage from "localforage";
import { IIndexDb, Nullable } from "./indexdb.api";
import { Resource } from "./model/resource";

export class IndexDb implements IIndexDb {

    async cache(resources: Array<Resource>): Promise<void> {
        for (let resource of resources) {
            let key = resource.name;
            let ut = resource.utime;

            let data: Blob | null = await localforage.getItem(key);
            let ut_key = "!@_@!ut_" + key;
            if (data == null || await localforage.getItem(ut_key) != ut) {
                let data = this.retry(async () => {
                    return await (await fetch(resource.url)).blob();
                }, 3);

                if (data == null) {
                    continue;
                }

                await localforage.setItem(key, await data).then((value: Blob) => {
                    localforage.setItem(ut_key, ut);
                });
            }
        }
    }

    async get(key: string): Promise<Nullable<Blob>> {
        let data: Blob | null = await localforage.getItem(key);
        return new Promise<Nullable<Blob>>((resolve) => resolve(data));
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
