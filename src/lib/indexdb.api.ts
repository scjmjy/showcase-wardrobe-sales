import { Resource } from "./model/resource";

export type Nullable<T> = T | null;

export interface IIndexDb {
    get(resource: Resource): Promise<Nullable<Blob>>;
}
