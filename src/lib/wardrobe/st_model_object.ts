import { StSketchRect } from "../geometry/st_geometric_2d";
import { StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StObject } from "../utility/st_object";
import { StIAccesory, StIModel } from "./st_model_interface";
import { v4 as uuidv4 } from "uuid";
import { StSketchMesh } from "./st_mesh_object";

export abstract class StModel extends StObject implements StIModel {
    readonly uuid: string;
    private position: StPoint3;
    private beta = 0;
    private parent: StIModel | null;
    private childen: StIModel[] = [];
    private width: number;
    private height: number;
    private depth: number;

    meshList: StSketchMesh[];

    //constructor(obj: any);
    constructor(obj: StModel) {
        super();
        this.parent = obj.parent;
        this.width = obj.width || 0;
        this.height = obj.height || 0;
        this.depth = obj.depth || 0;
        this.position = obj.position || new StSketchVector3(0, 0, 0);
        this.uuid = uuidv4();
        //this.sketchMesh = obj.sketchMesh;
        this.meshList = [];
    }

    rotateY(angle: number): void {
        if (this.meshList.length < 1) {
            throw Error("no mesh!");
        }
        const parent = this.meshList[0];
        parent.rotateY(angle);
        this.beta += angle;
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

    setWidth(w: number): void {
        this.width = w;
    }
    setHeight(h: number): void {
        this.height = h;
    }
    setDepth(w: number): void {
        this.width = w;
    }
 
    abstract updateMesh(): void;

    /* 
     * Changing w/h/d may cause updating the 3D mesh in BABYLON  
     * 
    setWidth(w: number) {
        this.width = w;
    }
    setHeight(h: number): void {
        this.height = h;
    }
    setDepth(d: number): void {
        this.depth = d;
    }*/

    setParent(parent: StIModel): void {
        this.parent = parent;
    }
    getParent(): StIModel | null {
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
