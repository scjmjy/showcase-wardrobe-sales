import localforage from "localforage";
import { IIndexDb, Nullable } from "./indexdb.api";
import { Resource } from "./model/resource";

export type DBValue = {
    etag: string;
    file: Blob;
};

export class IndexDb implements IIndexDb {
    async cache(resources: Array<Resource>): Promise<void> {
        for (const resource of resources) {
            await this.get(resource);
        }
    }

    async get(resource: Resource): Promise<Nullable<Blob>> {
        const key = resource.name;
        const value: Nullable<DBValue> = await localforage.getItem(key);
        const options = {
            headers: {
                "If-None-Match": value != null ? value.etag : "",
            },
        };

        const f = await fetch(resource.url, options)
            .then(async function (response) {
                const status = response.status;
                if (status == 200) {
                    const etag = response.headers.get("etag");
                    const blob = await response.blob();
                    localforage.setItem(key, { etag: etag, file: blob });
                    return blob;
                } else if (status == 304 && value != null) {
                    return value.file;
                } else {
                    return null;
                }
            })
            .catch(function (error) {
                console.error(error);
                return null;
            });

        return f;
    }
}
