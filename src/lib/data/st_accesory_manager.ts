import { StObject } from "../utility/st_object";
import { StCubePart, StPulloutType } from "../utility/st_sketch_type";
import { StIAccesoryData, StIPulloutInfo } from "./st_accesory_data";
import { StSketchCache } from "./st_sketch_cache";

/**
 * An accesory is also a product, which has a product-id and multiple models.
 *
 * ------------ Examples  ------------------------------------------------------
 * Product/Accesory: A Wooden Drawer with a fixed-thick steel slider;
 *
 * ==== Model ====
 * 1) Paint Color: NO-Color Water Paint;
 * 2) Wood Texture: White Oak;
 * 3) Size: 800x250x550;
 *
 */
export const DEFAULT_ROOT_URL = "./drobe/accessories/";

/**
 * Local Cache is searched for a new accesory.
 */
export class StAccesoryManager extends StObject {
    private readonly cache: StSketchCache = new StSketchCache();

    getAccesoryData(product_id: number, model_id?: string): StIAccesoryData {
        return this._queryHardcode(product_id, model_id);
    }

    /**
     * TODO: load from remote CDN, if local cache is FULL.
     *
     * @param product_id
     * @param model_id
     * @returns
     */
    async queryAccesory(product_id: number, model_id?: string): Promise<StIAccesoryData> {
        const cache = this.cache;
        const acce_data = this._queryHardcode(product_id, model_id);
        const key = await cache.fetchRemoteFile(acce_data.rootUrl, acce_data.filename);
        const file: File | null = await this.cache.loadFileFromCache(key);
        if (!file) {
            throw Error("Fail to load file form cache by key: " + key);
        }
        acce_data.localKey = key;
        console.debug("Query Accesory Success: %o", acce_data);
        return acce_data;
    }

    /**
     * @deprecated by queryAccesory
     */
    queryAccesorytData22(product_id: number, model_id?: string): StIAccesoryData {
        const acce_data = this._queryHardcode(product_id, model_id);
        this.cache.fetchRemoteFile(acce_data.rootUrl, acce_data.filename).then((key) => {
            acce_data.localKey = key;
            console.log("## cache file success: %s", key);
        });
        return acce_data;
    }

    private _queryHardcode(product_id: number, model_id?: string): StIAccesoryData {
        console.log("TODO: query Accesory data from DB by pid/mid: %s/%s...", product_id, model_id);

        const acce_info: StIAccesoryData = {
            partType: StCubePart.PULLOUT,
            pid: product_id,
            mid: model_id ? model_id : "",
            width: -1,
            height: -1,
            depth: -1,
            rootUrl: DEFAULT_ROOT_URL,
            filename: "_fake.glb.go2hell",
        };

        switch (product_id) {
            case 186395:
                acce_info.width = 310;
                acce_info.height = 330;
                acce_info.depth = 340;
                acce_info.filename = "PQPM0100_00186395_res512_box.glb";
                break;

            /**
             * IKEA 6-compartment storage: 245880
             * 	.width =  350;
             *  .height= 1250
             * 	.depth =  450;
             */
            case 245880:
                acce_info.width = 350;
                acce_info.height = 1250;
                acce_info.depth = 450;
                acce_info.filename = "PQPM0100_00245880_res512_6-compartment-storage.glb";
                break;

            /**
             * IKEA Drawer: 246342
             * - W: 1000
             * - H:  170
             * - D:  580
             * - Texture: 黑褐色
             *
             * NOTE: Pay attention to the LOCAL space of this 3d model:
             * 1. the X & Z axies of the LOCAL space are opposite to the WORLD/CUBE space!
             * 2. The origin of the LOCAL space the center of the bottom face.
             */
            case 246342:
                acce_info.width = 1000;
                acce_info.height = 170;
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00246342_res512_drawer.glb";
                break;

            /**
             * PID:246356
             * IKEA pull-out tray/ 仿白色橡木纹
             * 	.width =  500
             *  .height=   35
             * 	.depth =  580
             *  .texture: 仿白色橡木纹
             */
            case 246356:
                acce_info.width = 500;
                acce_info.height = 170; // add 100+ mm space for storage
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00246356_res512_pull-out-tray.glb";
                break;

            /**
             * IKEA pull-out tray: 246380
             * 	.width =  1000
             *  .height=    35
             * 	.depth =  580
             *  .texture:  黑褐色
             */
            case 246380:
                acce_info.width = 1000;
                acce_info.height = 170; // add 100+ mm space for storage
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00246380_res512_pull-out-tray.glb";
                break;

            /**
             * IKEA pull-out tray: 246714
             * - width : 1000
             * - height:  170
             * - depth :  580
             * - texture: 仿白色橡木纹
             */
            case 246714:
                acce_info.width = 1000;
                acce_info.height = 170;
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00246714_res512_draws-with-glass-front.glb";
                break;

            /**
             * PID: 256944
             * IKEA clothes rail / 挂衣杆, KOMPLEMENT 康普蒙
             * - width  :  750
             * - height :
             * - depth  :  580
             * - texture:  深灰色
             */
            case 256944:
                acce_info.width = 750;
                acce_info.height = 170; // no data in excel, add it myself
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00256944_res512_clothes-rail.glb";
                break;

            /**
             * PID: 395964
             * IKEA drawer with glass front / 抽屉带玻璃前板, KOMPLEMENT 康普蒙
             * - width  : 1000
             * - height :  170
             * - depth  :  580
             * - texture: 褐色白蜡木纹
             */
            case 395964:
                acce_info.width = 1000;
                acce_info.height = 170;
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00395964_res512_drawer-with-glass-front.glb";
                break;

            /**
             * PID: 395978
             * IKEA shelf / 搁板, KOMPLEMENT 康普蒙
             * - width  :  750
             * - height :
             * - depth  :  580
             * - texture:  	褐色白蜡木纹
             */
            case 395978:
                acce_info.width = 750;
                acce_info.height = 20;
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00395978_res512_shelf.glb";
                break;

            /**
             * IKEA PID: 429676
             * lockable drawer / 可锁抽屉, KOMPLEMENT 康普蒙
             * - width :  750
             * - height:
             * - depth :  580
             * - texture: 白色
             */
            case 429676:
                acce_info.width = 750;
                acce_info.height = 170; // no data in excel, add myself
                acce_info.depth = 580;
                acce_info.filename = "PQPM0100_00429676_res512_lockable-drawer.glb";
                break;

            /**
             * IKEA PID: 437577
             * pull-out tray / 拉出式托盘, KOMPLEMENT 康普蒙
             * - width : 1000
             * - height:  350
             * - depth :   35
             * - texture: 仿白色橡木纹
             */
            case 437577:
                acce_info.width = 1000;
                acce_info.height = 350;
                acce_info.depth = 35;
                acce_info.filename = "PQPM0100_00437577_res512_pull-out-tray.glb";
                break;

            /**
             * IKEA box with compartments: 10185593 / 储物盒带格
             * - width : 1000
             * - height:  170
             * - depth :  580
             * - texture: 白色
             */
            case 10185593:
                acce_info.width = 440;
                acce_info.height = 110;
                acce_info.depth = 340;
                acce_info.filename = "PQPM0100_10185593_res512_box-with-compartments.glb";
                break;

            case -1:
                acce_info.width = 750;
                acce_info.height = 0;
                acce_info.depth = 580;
                acce_info.filename = "";
                break;

            default:
                throw Error("Unknown Product ID: " + product_id);
        }
        return acce_info;
    }

    async loadPulloutInfo(
        parent_cube: string,
        acce_name: string,
        product_id: number,
        model_id?: string,
    ): Promise<StIPulloutInfo> {
        const acce_info: StIAccesoryData = await this.queryAccesory(product_id, model_id);
        const pullout_info = StAccesoryManager.buildPulloutInfo(parent_cube, acce_info, acce_name);
        return pullout_info;
    }

    static buildPulloutInfo(cube_name: string, acce_info: StIAccesoryData, pull_name: string): StIPulloutInfo {
        const pull_info = Object.assign(acce_info, {
            name: pull_name,
            cubeName: cube_name,
            pulloutType: StPulloutType.DRAWER,
        });
        return pull_info;
    }
}
