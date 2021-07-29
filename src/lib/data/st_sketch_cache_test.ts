import localforage from "localforage";
import { StObject } from "../utility/st_object";
import { StAccesoryManager } from "./st_accesory_manager";
import { StSketchCache } from "./st_sketch_cache";

export class StSketchCacheTest extends StObject {
    cache: StSketchCache = new StSketchCache();
    acceMgr: StAccesoryManager = new StAccesoryManager();

    async addCacheItems(cnt: number): Promise<string> {
        const pid = 246356; // IKEA pull-out tray/仿白色橡木纹, height: 35? --- size: 3MB
        const data = this.acceMgr.getAccesoryData(pid);
        const key: string = await this.cache.fetchRemoteFile(data.rootUrl, data.filename);
        const file: File | null = await this.cache.loadFileFromCache(key);
        if (!file) {
            throw Error("Fail to load File");
        }
        let success = 0,
            failure = 0;
        // [Guilin: 2021-7-24] On Android Simulate(500MB Space). localfroage.setItem() blocks if >50MB is used by indexedDB.
        const start_key = await localforage.length();
        for (let i = 0; i < cnt; i++) {
            const k = key + "_" + i + start_key;
            const f: File | null = await localforage.setItem(k, file);
            console.debug("cache No. %d: %s ----- %s", i, k, f ? "Success" : "Fail!!");
            if (f) {
                success++;
            } else {
                failure++;
                break;
            }
        }
        return `Cache ${cnt}, Success: ${success}, Failure:${failure}`;
    }

    async showCacheInfo(show_keys = false): Promise<string> {
        let str = "[CacheInfo] Localforage --> IndexedDB ";
        str += "\n";
        str += await this.__navigatorStorage();
        str += `\n Driver Names: IndexedDB - ${localforage.INDEXEDDB}, WebSQL - ${localforage.WEBSQL}, LocalStoage - ${localforage.LOCALSTORAGE}`;
        str += "\n Localforage Config: " + JSON.stringify(localforage.config());
        //str += '\n Localforage Driver: ' + localforage.driver();
        str += "\n Localforage Length(key number): " + (await localforage.length());

        if (!show_keys) {
            return str;
        }
        const list = await localforage.keys();
        //str += "\n Key number : " + list.length;
        let i = 0;
        for (const k of list) {
            // const item = localforage.getItem(k);
            str += "\n ---- key[" + i++ + "] " + k;
            if (i > 5) {
                break;
            }
        }
        console.log("## cache info: \n" + str);
        return str;
    }

    init(): void {
        const opt = {
            driver: localforage.INDEXEDDB,
            name: "StSketchCache",
            version: 1.0,
            size: 10 * 1024 * 1024,
            storeName: "keyvaluepairs",
            description: "TODO: cook ... (description) ....",
        };
        const cfg = localforage.config(opt);
        console.log("init localforage: %o ---- %s", opt, cfg ? "Success" : "Fail");
    }

    async __navigatorStorage(): Promise<string> {
        // [Guilin: 2021-7-23] The real space usage of Local Storage (e.g. IndexedDB)
        // NOTE: DOES NOT work on iOS or Android.
        // see: https://developers.google.com/web/updates/2017/08/estimating-available-storage-space
        if ("storage" in navigator && "estimate" in navigator.storage) {
            const { usage, quota } = await navigator.storage.estimate();
            if (!usage || !quota) {
                return `[Navigator Storage] ERROR: usage/quota is not Found!`;
            }
            console.log(`[Navigator Storage] Using ${Math.round(usage / 1024)} out of ${Math.round(quota / 1024)} KB.`);
            const percentUsed = Math.round((usage / quota) * 100);
            const usageInMib = Math.round(usage / (1024 * 1024));
            const quotaInMib = Math.round(quota / (1024 * 1024));
            return `[Navigator Storage] ${usageInMib} out of ${quotaInMib} MiB used (${percentUsed}%)`;
        } else {
            return `[Navigator Storage] FATAL: navigator.storage ERROR!!!`;
        }
    }
}
