import { Resource } from "./model/resource";

export type Nullable<T> = T | null;

export interface IIndexDb {

    /**
     * Cache the web resources into IndexDB.
     *
     * @param resources, the resource description data.
     */
    cache(resources: Array<Resource>): Promise<void>;

    /**
     * Get the cached resource as Blob according to a specific key.
     * @param key, the key to resource.
     * @return The cached resource data. In the case which no data for the key, when lazyLoad is true, async cache the
     * resource and then return the data; when the lazyLoad is false returns null.
     */
    get(key: string): Promise<Nullable<Blob>>;
}
