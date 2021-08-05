/**
 * @file    st_geometric_3d.ts
 * @author  Guilin
 * @description  Geomitric 3D class
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-21] Created.
 */

import { StObject } from "../utility/st_object";

abstract class StGeometic3D extends StObject {
    abstract clone(): StGeometic3D;
}

/**
 * Define this vector class, NOT the point.
 * REASON: a VECTOR has +/- operation. But a POINT does not!
 */
export class StSketchVector3 extends StGeometic3D {
    x: number;
    y: number;
    z: number;

    constructor(x?: number, y?: number, z?: number) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.z = z ? z : 0;
    }

    multiple(v: number): StSketchVector3 {
        const vec = this.clone();
        vec.x *= v;
        vec.y *= v;
        vec.z *= v;
        return vec;
    }

    add(v: StSketchVector3): StSketchVector3 {
        const vec = this.clone();
        vec.x += v.x;
        vec.y += v.y;
        vec.z += v.z;
        return vec;
    }

    minus(v: StSketchVector3): StSketchVector3 {
        const vec = this.clone();
        vec.x -= v.x;
        vec.y -= v.y;
        vec.z -= v.z;
        return vec;
    }

    selfAdd(v: StSketchVector3): StSketchVector3 {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    selfMinus(v: StSketchVector3): StSketchVector3 {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    /**
     * convert to BABYLON Vector2
     * @returns
     *
     * @deprecated Converting to BABYLON in babylon-depend files
     */
    scaleToBabylon(scale = 1000): BABYLON.Vector3 {
        return new BABYLON.Vector3(this.x / scale, this.y / scale, this.z / scale);
    }

    clone(): StSketchVector3 {
        const obj = new StSketchVector3(this.x, this.y, this.z);
        return obj;
    }
}

export type StPoint3 = StSketchVector3;

/**
 * @deprecated:  by StPoint3
 */
export type StSketchLocation = StSketchVector3;

export class StBoundaryBox extends StGeometic3D {
    readonly pos!: StPoint3;
    //readonly pos1!: StPoint3;
    readonly width!: number;
    readonly height!: number;
    readonly depth!: number;

    constructor(p0: StPoint3, w: number, h: number, d: number) {
        super();
        this.pos = p0;
        this.width = w;
        this.height = h;
        this.depth = d;
    }

    clone(): StBoundaryBox {
        const obj = new StBoundaryBox(this.pos.clone(), this.width, this.height, this.depth);
        return obj;
    }
}
