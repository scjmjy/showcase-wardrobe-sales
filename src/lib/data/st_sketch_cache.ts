import localforage from "localforage";
import { StObject } from "../utility/st_object";

export class StSketchCache extends StObject {
    makeFileKey(root_url: string, filename: string): string {
        return "st_key_" + root_url + "/" + filename;
    }

    async loadFile(root_url: string, filename: string): Promise<File | null> {
        const file_key = this.makeFileKey(root_url, filename);
        return await this.loadFileFromCache(file_key);
    }

    /**
     * load file from local cache and into BABYLON FilesInputStore
     * @param file_key KEY in localforage
     */
    async loadFileFromCache(file_key: string): Promise<File | null> {
        const file: File | null = await localforage.getItem(file_key);
        if (!file) {
            console.error(`File ${file_key} not cached`);
            return null;
        }

        // [Guilin: 2021-7-21] For keys in BABYLON.FilesInputStore.FilesToLoad[], use lowerCase() WITHOUT Prefix '///'!!
        //
        // The starting '///' in the key of FilesInputStore.FilesToLoad[] makes SceneLoader._loadData(...):
        //   --> 4.0.3: difficult to find the saved 'file' object. (I DO NOT known how babylon find/load the *.glb file?!)
        //   --> 4.2.0: fail to find the saved 'file' object.
        //
        // IKEA PAX adds '///' to the key of FilesInputStore.FilesToLoad[].
        // It works in Babylon.js 4.0.3, which IEKA PAX uses. But this trick fails in Babylon.js 4.2.0.
        //
        //      const baby_key = `///${key.toLowerCase()}`;
        //      BABYLON.FilesInputStore.FilesToLoad[`${baby_key}`] = file;
        //
        // ==== REFERENCE ====
        // Source Code of Babylon.js: https://github.com/BabylonJS/Babylon.js.git
        // - File: src/Loading/sceneLoader.ts:
        // - Class: SceneLoader
        // - Method: ImportMesh(...) --> _loadData(...)
        //
        const baby_key = `${file_key.toLowerCase()}`; // Works in Babylon.js 4.0.3 & 4.2.0
        BABYLON.FilesInputStore.FilesToLoad[`${baby_key}`] = file;
        console.debug('Load file(key:"%s"): cache -->  BABYLON.FilesInputStore.FilesToLoad[%s] ', file_key, baby_key);
        return file;
    }

    async isFileCached(file_key: string): Promise<boolean> {
        const file: File | null = await localforage.getItem(file_key);
        return file != null;
    }

    /**
     * Download the remote file and save into cache.
     * If the file is already cached and 'force' is NOT true, do not downloaded.
     *
     * @param root_url
     * @param filename
     * @param force
     * @returns
     */
    async fetchRemoteFile(root_url: string, filename: string, force?: boolean): Promise<string> {
        const file_path = root_url + "/" + filename;
        const file_key = this.makeFileKey(root_url, filename);
        const is_cached: boolean = await this.isFileCached(file_key);
        if (!is_cached || force) {
            const file_blob = await (await fetch(`${file_path}`)).blob();
            await localforage.setItem(file_key, file_blob);
            console.debug(
                "Fecth file: %s, Save into cache: key: %s, size:%d KB ",
                file_path,
                file_key,
                file_blob.size / 1024,
            );
        }
        return file_key;
    }
}
