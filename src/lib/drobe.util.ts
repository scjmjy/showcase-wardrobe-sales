/**
 * @file    drobe_util.ts
 * @author 	Guilin
 *
 * @description utility for wardrobe API
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-08-18] Created
 */

import * as BABYLON from "babylonjs";

import { Graphics } from "@/lib/graphics";
import { Area, Door, Position, Item } from "@/lib/scheme";
import { StObject } from "@/lib/utility/st_object";
import { StSketchVector3 } from "./geometry/st_geometric_3d";
import { BizData, CubeData, ObjectType } from "@/lib/biz.data";
import { StVector } from "./geometry/st_vector_2d";
import { StSketchPoint, StSketchRect } from "./geometry/st_geometric_2d";
import request from "@/utils/request";
import { ElMessage } from "element-plus";

export class HmBoundingBox {
    startPoint: Position;
    endPoint: Position;
    constructor(startPoint: Position, endPoint: Position) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
}

export class HmModel extends StObject {
    position: Position;
    readonly rotation: StSketchVector3;
    readonly scaling: StSketchVector3;
    readonly url: string;

    constructor(opt: { position?: Position; rotation?: StSketchVector3; scaling?: StSketchVector3; url: string }) {
        super();
        this.position = opt.position || new Position(0, 0, 0);
        this.rotation = opt.rotation || new StSketchVector3();
        this.scaling = opt.scaling || new StSketchVector3();
        this.url = opt.url;
    }
}

export class HmPartManifest extends StObject {
    bbox: HmBoundingBox;
    size: StSketchVector3;
    models: HmModel[];

    static buildFromJson(json: string): HmPartManifest {
        const obj: HmPartManifest = JSON.parse(json);
        return obj;
    }

    static buildFromUrl(part_url: string, baseUrl?: string): HmPartManifest | Promise<HmPartManifest> {
        let obj: HmPartManifest;
        if (baseUrl) {
            return new Promise((resolve, reject) => {
                request({
                    url: baseUrl + part_url,
                    method: "GET",
                    responseType: "json",
                })
                    .then((res) => {
                        const mf = new HmPartManifest({
                            bbox: new HmBoundingBox(res.data.bbox.startPoint, res.data.bbox.startPoint),
                            size: new StSketchVector3(res.data.size.x, res.data.size.y, res.data.size.y),
                            models: res.data.models.map(
                                (m: HmModel) =>
                                    new HmModel({
                                        position: m.position,
                                        rotation: m.rotation,
                                        scaling: m.scaling,
                                        url: m.url,
                                    }),
                            ),
                        });
                        resolve(mf);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        } else {
            obj = require("@/assets/" + part_url);
        }

        // [guilin: 8-20] 'obj' is NOT an HmPartManifest object!
        // Reason: `${obj}` -- >  [object Object]
        // return obj;
        const mf = new HmPartManifest({
            bbox: obj.bbox,
            size: obj.size,
            models: obj.models,
        });
        return mf;
    }

    constructor(opt: { bbox?: HmBoundingBox; size: StSketchVector3; models: HmModel[] }) {
        super();
        this.bbox = opt.bbox || new HmBoundingBox(new Position(0, 0, 0), new Position(0, 0, 0));
        this.size = opt.size;
        this.models = opt.models;
    }
}

class DrobeUtil extends StObject {
    /* 
    test_addDoor(graphics: Graphics, bizdata: BizData): void {
        const door_part_id = -1;
        const door_mf_url = "bbf7f299-7ae8-4977-a26e-5e09b761a8fe.json";
        const door_type = 1;
        const door_cubes: string[] = [];
        const door = new Door(uuidv4(), door_part_id, door_mf_url, door_type, door_cubes);
        this.addDoor(graphics, scheme, door);
    } 

    // [guilin] code from front-3d
   	calcAvailableRect(acce_data: StIAccesoryData) : Array<StSketchRect> {
		const width = this.rect.a;
		let start_pt = this.rect.getStartPoint();
		const array = [];
		const fixed_rects = [];
		for(const fixed_part of this.parts) {
			fixed_rects.push(fixed_part.rect);
			console.log(`## get existing fixed-rect: ${fixed_part.rect}`);
		}

		// [Cook: 2021-7-19 ] add the last LOGICAL 'rectangle' whose height is ZERO, to calculate the top SPACE in the following for loop
		fixed_rects.push(StSketchRect.buildRectByStartPoint(this.rect.getPoint(3), this.rect.a, 0));

		for(const fixed_rect of fixed_rects) {
			const height = fixed_rect.getStartPoint().y - start_pt.y;
			const rect = StSketchRect.buildRectByStartPoint(start_pt, width, height);
			if(rect.a >= acce_data.width  && rect.b >= acce_data.height){
				array.push(rect);
			}
			start_pt = fixed_rect.getPoint(3);
		}
		return array;
	} 
    */

    /**
     * Find Cube's LEFT-BOTTOM corner in LOCAL/WORLD space
     */
    private _findCubeLeftBottom(cube: CubeData, local = true): StVector {
        if (local) {
            return new StVector((-1 * cube.width) / 2, 0);
        } else {
            // WORLD space
            return new StVector(cube.origin.x - cube.width / 2, cube.origin.y);
        }
    }

    private _buildCubeRect(cube: CubeData, local = true): StSketchRect {
        const start_pt = StSketchPoint.buildFromVector(this._findCubeLeftBottom(cube, local));
        return StSketchRect.buildRectByStartPoint(start_pt, cube.width, cube.height);
    }

    private _findCubeOccupied(bizdata: BizData, id: string, cube: CubeData): StSketchRect[] {
        const rects: StSketchRect[] = [];
        const items = bizdata.findItemsByCubeId(id);
        const cube_lb = this._findCubeLeftBottom(cube);
        if (items.length == 0) {
            console.log(`Find NONE occupied rect!`);
            return rects;
        }
        items.forEach((e: Item) => {
            // const mf = HmPartManifest.buildFromUrl(e.manifest) as HmPartManifest;
            this.assertValid(e.location);
            this.assertValid(e.location!.startPos);
            // calulate the part's LEFT-BOTTOM in WORLD Space.
            const vec = new StVector(e.location!.startPos!.x, e.location!.startPos!.y);
            vec.selfAdd(cube_lb);
            const pt = StSketchPoint.buildFromVector(vec);
            const r = StSketchRect.buildRectByStartPoint(pt, e.size.x, e.size.y);
            rects.push(r);
        });

        // console.log(`Find occupied rects: ${rects.length}`);
        return rects;
    }

    private _convertRectToArea(areas: Area[], rects: StSketchRect[], depth: number, cube_id: string): Area[] {
        rects.forEach((r) => {
            const p0 = r.getPosition(0);
            const p1 = r.getPosition(2);
            const area = new Area(
                cube_id,
                new Position(p0.x, p0.y, (depth / 2) * -1),
                new Position(p1.x, p1.y, depth / 2),
            );
            areas.push(area);
        });
        return areas;
    }

    getAvailableAreaByPart(
        bizdata: BizData,
        part: {
            id: number;
            width: number;
            height: number;
            depth: number;
            manifest: string;
            catId: number;
        },
    ): Area[] {
        const part_size = new StVector(part.width, part.height);
        return this._calcAvailableArea(bizdata, part_size);
    }

    /**
     * Search all cubes for all the available areas
     */
    getAvailableAreaByMfUrl(bizdata: BizData, part_mf_url: string): Area[] {
        const part: HmPartManifest = HmPartManifest.buildFromUrl(part_mf_url) as HmPartManifest;
        console.debug(`calculate available areas for part: ${part}`);
        const part_size = new StVector(part.size.x, part.size.y);
        return this._calcAvailableArea(bizdata, part_size);
    }

    private _calcAvailableArea(bizdata: BizData, part_size: StVector): Area[] {
        const areas: Area[] = [];
        for (const cube_id of bizdata.cubeMap.keys()) {
            const cube = bizdata.cubeMap.get(cube_id)!;
            const host = this._buildCubeRect(cube);
            const occupied = this._findCubeOccupied(bizdata, cube_id, cube);
            const rects = StSketchRect.calcAvailableRect(host, occupied, part_size);
            this._convertRectToArea(areas, rects, cube.depth, cube_id);
        }
        console.log(`Get ${areas.length} available areas: ${StObject.buildArrayString(areas)}`);
        return areas;
    }

    /**
     *
     * @param graphics
     * @param bizdata
     * @param ids  is NOT proviced, delete all doors
     */
    removeDoors(graphics: Graphics, bizdata: BizData, ids?: string[]): void {
        if (!ids || ids.length == 0) {
            ids = bizdata.getAllDoorsId();
            console.log(`to remove all doors. Count: ${ids.length} -- ${ids}`);
        }
        for (const id of ids) {
            this._removeDoor(graphics, bizdata, id);
        }
    }

    private _removeDoor(graphics: Graphics, bizdata: BizData, id: string): void {
        bizdata.removeDoor(id);
        // if (door) {
        //     console.log(`Remove door: ${StObject.buildString(door)}`);
        // } else {
        //     console.log(`Err: Door is NOT found: ${id}`);
        // }
    }

    /**
     * Add a door for cubes, which is described in object `door`;
     * @param scheme
     * @param door
     *
     * @returns UUID of the newly added door
     */
    addDoor(graphics: Graphics, bizdata: BizData, door: Door, baseUrl: string): string | Promise<string> {
        const door_pos = new BABYLON.Vector3(0, 0, 500);

        if (door.doorType == 1) {
            this.assertTrue(door.locations.length == 1, `ONLY ONE cube is needed to add a HINGE DOOR: ${door}`);
            const cube_data = bizdata.findCubeDataById(door.locations[0].id);
            if (!cube_data) {
                throw Error(`cannot find cube data by id: ${door.locations[0]}`);
            }
            door_pos.x += cube_data.origin.x;
            door_pos.y += 20;
            door_pos.z = cube_data.depth / 2;
        } else if (door.doorType == 2) {
            this.assertTrue(door.locations.length == 2, `TWO cubes are needed to add a SLIDE DOOR: ${door}`);
            const cube_data = bizdata.findCubeDataById(door.locations[0].id);
            if (!cube_data) {
                throw Error(`cannot find cube data by id: ${door.locations[0]}`);
            }
            door_pos.y += 20;
            door_pos.z = cube_data.depth / 2;
        } else {
            throw Error(`unknow door type: ${door}`);
        }

        // bizdata.addDoor(door);
        const door_name = `${ObjectType.DOOR}_${door.id}`;
        const door_mf = HmPartManifest.buildFromUrl(door.manifest, baseUrl);
        if (door_mf instanceof Promise) {
            return door_mf.then((res) => {
                // const url = "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/" + res.models[0].url;
                const url = baseUrl + res.models[0].url;
                return graphics
                    .importMesh(url, door_name, door_pos)
                    .then(() => {
                        return door.id;
                    })
                    .catch((err) => {
                        ElMessage({
                            type: "error",
                            message: "加载模型文件错误",
                        });
                        console.log("[importMesh] err", err);
                        return "";
                    });
            });
        } else {
            graphics.importMesh(door_mf.models[0].url, door_name, door_pos);
            console.log(`add door at ${door_pos}: ${door}`);
            return door.id;
        }
    }
}

export const drobeUtil = new DrobeUtil();
