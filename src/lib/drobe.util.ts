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
import { Door, Position, Scheme } from "@/lib/scheme";
import { StObject } from "@/lib/utility/st_object";
import { StSketchVector3 } from "./geometry/st_geometric_3d";
import { v4 as uuidv4 } from "uuid";
import { BizData } from "@/lib/bizdata";

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
    } */



    /**
     * Add a door for cubes, which is described in object `door`;
     * @param scheme
     * @param door
     *
     * @returns UUID of the newly added door
     */
    addDoor(graphics: Graphics, bizdata: BizData, door: Door): string {
        //const door_pos = new BABYLON.Vector3(0, 0, 400); // todo: calculate position
        const door_pos = new BABYLON.Vector3(0, 0, 500); 

        if(door.doorType == 1) {
            this.assertTrue(door.cubes.length == 1, `ONLY ONE cube is needed to add a HINGE DOOR: ${door}`);
            const cube_data = bizdata.FindCubeDataById(door.cubes[0]);
            if(!cube_data) {
                throw Error(`cannot find cube data by id: ${door.cubes[0]}`);
            }
            door_pos.x += cube_data.origin.x;
            door_pos.z = cube_data.depth/2;
        }else if(door.doorType == 2) {
            this.assertTrue(door.cubes.length == 2, `TWO cubes are needed to add a SLIDE DOOR: ${door}`);
            const cube_data = bizdata.FindCubeDataById(door.cubes[0]);
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

    addSingleDoor() {}

    addDoubleDoor() {}
}

export const drobeUtil = new DrobeUtil();
