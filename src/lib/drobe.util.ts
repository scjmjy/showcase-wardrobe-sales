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
import * as GUI from "babylonjs-gui";

import { Graphics } from "@/lib/graphics";
import { Area, Door, Position, Scheme } from "@/lib/scheme";
import { StObject } from "@/lib/utility/st_object";
import { StSketchVector3 } from "./geometry/st_geometric_3d";
import { v4 as uuidv4 } from "uuid";
import { BizData, CubeData } from "@/lib/biz.data";
import { StVector } from "./geometry/st_vector_2d";
import { StSketchPoint, StSketchRect } from "./geometry/st_geometric_2d";

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

    static buildFromUrl(part_url: string): HmPartManifest {
        if(part_url.indexOf('mf/') == 0) {
            return require("@/assets/" + part_url);
        }
        const mf = require("@/assets/mf/" + part_url);
        const obj: HmPartManifest = mf;
        return obj;
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
     * Find Cube's LEFT-BOTTOM corner in WORLD space
     */
    private _findCubeLeftBottom(cube: CubeData): StVector {
        return new StVector(cube.origin.x - cube.width/2, cube.origin.y);
    }


    private _buildCubeRect(cube: CubeData): StSketchRect {
        const start_pt = StSketchPoint.buildFromVector( this._findCubeLeftBottom(cube) );
        return StSketchRect.buildRectByStartPoint(start_pt, cube.width, cube.height);
    }

    private _findCubeOccupied(bizdata: BizData, id: string, cube: CubeData): StSketchRect[] {
        const rects: StSketchRect[] = [];
        const items = bizdata.findCubeItems(id);
        const cube_lb = this._findCubeLeftBottom(cube);
        if(items == null || items.length == 0)  {
            console.log(`Find NONE occupied rect!`);
            return rects;
        }
        items.forEach(e => {
            const mf = HmPartManifest.buildFromUrl(e.manifest);
            this.assertValid(e.location);  
            this.assertValid(e.location!.startPos);
            // calulate the part's LEFT-BOTTOM in WORLD Space.
            const vec = new StVector(e.location!.startPos!.x, e.location!.startPos!.y);
            vec.selfAdd(cube_lb);
            const pt = StSketchPoint.buildFromVector(vec);
            const r = StSketchRect.buildRectByStartPoint(pt, mf.size.x, mf.size.y);
            rects.push(r);
        });
        
        console.log(`Find occupied rects: ${rects.length}`);
        return rects;
    }

    private _convertRectToArea( areas: Area[], rects: StSketchRect[], depth:number, cube_id: string ) : Area[] {
        rects.forEach( r => {
            const p0 = r.getStartPosition();
            const p1 = r.getPosition(3);
            const area = new Area(
                cube_id, 
                new Position(p0.x, p0.y, depth/2 * -1), 
                new Position(p1.x, p1.y, depth/2 ) );
            areas.push(area);
        });
        return areas;
    }

    getAvailableAreaById(bizdata: BizData, part_id: string ): Area[] {
        const mf_url = bizdata.partManifestMap.get(`${part_id}`);
        if(! mf_url) {
            throw Error(`NO manifest is found by ID; ${part_id}`);
        }
        return this.getAvailableAreaByMfUrl(bizdata, mf_url);
    }

    /**
     * Search all cubes for all the available areas
     */
    getAvailableAreaByMfUrl(bizdata: BizData, part_mf_url: string ): Area[] {
        const part: HmPartManifest = HmPartManifest.buildFromUrl(part_mf_url);
        console.debug(`calculate available areas for part: ${part}`);
        const areas: Area[] = [];
        const part_size = new StVector(part.size.x, part.size.y);
        for(const cube_id of bizdata.cubeMap.keys()) {
            const cube = bizdata.cubeMap.get(cube_id)!;
            const host = this._buildCubeRect(cube);
            const occupied = this._findCubeOccupied(bizdata, cube_id, cube);
            const rects = StSketchRect.calcAvailableRect(host, occupied, part_size);
            this._convertRectToArea(areas, rects, cube.depth, cube_id);
        }
        console.log(`Get ${areas.length} available areas: ${areas}`);
        return areas;
    }


    /**
     * Add a door for cubes, which is described in object `door`;
     * @param scheme
     * @param door
     *
     * @returns UUID of the newly added door
     */
    addDoor(graphics: Graphics, bizdata: BizData, door: Door): string {
        const door_pos = new BABYLON.Vector3(0, 0, 500); 

        if(door.doorType == 1) {
            this.assertTrue(door.cubes.length == 1, `ONLY ONE cube is needed to add a HINGE DOOR: ${door}`);
            const cube_data = bizdata.findCubeDataById(door.cubes[0]);
            if(!cube_data) {
                throw Error(`cannot find cube data by id: ${door.cubes[0]}`);
            }
            door_pos.x += cube_data.origin.x;
            door_pos.z = cube_data.depth/2;
        }else if(door.doorType == 2) {
            this.assertTrue(door.cubes.length == 2, `TWO cubes are needed to add a SLIDE DOOR: ${door}`);
            const cube_data = bizdata.findCubeDataById(door.cubes[0]);
            if(!cube_data) {
                throw Error(`cannot find cube data by id: ${door.cubes[0]}`);
            }
            door_pos.z = cube_data.depth/2;
        }else {
            throw Error(`unknow door type: ${door}`);
        }

        door.id = uuidv4();
        const door_name = door.id;
        const door_mf = HmPartManifest.buildFromUrl(door.manifest);
        graphics.importMesh(door_mf.models[0].url, door_name, door_pos);
        console.log(`add door at ${door_pos}: ${door}`);
        return door.id;
    }

}

export const drobeUtil = new DrobeUtil();