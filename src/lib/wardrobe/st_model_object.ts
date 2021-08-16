/**
 * @file    st_model_object.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-28] Created.
 *
 */

import { StSketchRect } from "../geometry/st_geometric_2d";
import { StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StObject, StUuidObject } from "../utility/st_object";
import { StIAccesory, StIModel } from "./st_model_interface";
import { v4 as uuidv4 } from "uuid";
import { StSketchMesh } from "./st_mesh_object";
import { jsonIgnore} from "json-ignore";

/**
 * @description A model holds data and method for a biz object.
 *
 * A model has several 3D mesh objects. When a 3D mesh is selected, a model must be found by the ID/Name/tag of the selected 3D mesh.
 *
 * The main flow when a mesh is selected:
 *
 * 1) View: Edit a Wardrobe Unit
 * Curent Model: Skecth-Unit
 *
 * User: select a CUBE (bounding box)
 * [Algorithm]
 * Search for the cube in the unit by mesh-ID
 *
 * [operation]
 * change cube size: Width/Height/Depth/bottomGap
 * change cube color
 * change cube texture
 *
 * 2) View: Edit a cube framework;
 * Curent Model: Skecth-Cube
 *
 * User: select a BOARD
 * [Algorithm]
 * Search for the level/division in this cube by mesh-ID
 *
 * [operation]
 * change level/division offset (move)
 *
 * 3) View: Edit Accesory in a cube
 * Curent Model: Skecth-Cube
 *
 * User: select the area in a division
 *
 * [Algorithm]
 * Search for the division in this cube by mesh-ID
 *
 * [operation]
 * Add/Move/Delete an accesory.
 *
 */
export abstract class StModel extends StUuidObject implements StIModel {
    //readonly uuid: string;
    private position: StPoint3;
    private parent?: StIModel;
    private childen: StIModel[] = [];
    private width: number;
    private height: number;
    private depth: number;
    private rotate: StSketchVector3 = new StSketchVector3();

    private dirty = false;
    private deleted = false;

    @jsonIgnore()
    protected meshList: StSketchMesh[];

    constructor(obj: {
        //uuid: string;
        position?: StPoint3;
        rotate?: StSketchVector3; // Reserved
        parent?: StIModel;
        childen?: StIModel[];
        width?: number;
        height?: number;
        depth?: number;
    }) {
        super();
        this.parent = obj.parent;
        this.width = obj.width || 0;
        this.height = obj.height || 0;
        this.depth = obj.depth || 0;
        this.position = obj.position || new StSketchVector3(0, 0, 0);
        //this.uuid = uuidv4();
        //this.sketchMesh = obj.sketchMesh;
        this.meshList = [];
    }

    clearMesh(): void {
        for (const mesh of this.meshList) {
            mesh.deleteMesh();
        }
        const cnt = this.meshList.length;
        this.meshList.slice(0, cnt);
    }

    delete(): void {
        this.clearMesh();
        this.deleted = true;
    }

    rotateY(angle: number): void {
        if (this.meshList.length < 1) {
            throw Error("no mesh!");
        }
        const parent = this.meshList[0];
        parent.rotateY(angle);
        this.rotate.y += angle;
    }

    translate(v: StSketchVector3): void {
        if (this.meshList.length < 1) {
            throw Error("no mesh!");
        }
        const parent = this.meshList[0];
        parent.translate(v);
        this.position.selfAdd(v);
    }

    getPosition(): StSketchVector3 {
        return this.position.clone();
    }

    getSize(): StSketchVector3 {
        return new StSketchVector3(this.width, this.height, this.depth);
    }

    getHeight(): number {
        return this.height;
    }
    getWidth(): number {
        return this.width;
    }
    getDepth(): number {
        return this.depth;
    }

    setWidth(w: number): void {
        this.width = w;
        this.onEditFinish();
    }
    setHeight(h: number): void {
        this.height = h;
        this.onEditFinish();
    }
    setDepth(w: number): void {
        this.depth = w;
        this.onEditFinish();
    }

    /**
     * update mesh if 'dirty' is set
     */
    abstract updateMesh(): void;

    protected onEditFinish(): void {
        this.dirty = true;
    }

    setParent(parent: StIModel): void {
        this.parent = parent;
    }
    getParent(): StIModel | undefined {
        return this.parent;
    }

    getChild(uuid: string): StIModel | null {
        for (const ch of this.childen) {
            if (uuid == ch.uuid) {
                return ch;
            }
        }
        return null;
    }
    addChild(child: StIModel): void {
        this.childen.push(child);
    }
    getChilden(): StIModel[] {
        return this.childen;
    }
    deleteChild(child_uuid: string): StIModel | null {
        const cnt = this.childen.length;
        for (let i = 0; i < cnt; i++) {
            const ch = this.childen[i];
            if (child_uuid == ch.uuid) {
                this.childen.splice(i, 1);
                return ch;
            }
        }
        return null;
    }
}

export abstract class StSketchAccesory extends StModel implements StIAccesory {
    getOccupyRect(): StSketchRect {
        throw new Error("Method not implemented.");
    }
    overlapWith(acce: StSketchAccesory): boolean {
        throw new Error("Method not implemented." + acce.toString());
    }
}
