/**
 * @file    st_geometric_2d.ts
 * @author  Guilin
 *
 * @description  Geomitric 2D class
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-21] Created.
 *
 */

import { StObject, StUuidObject } from "../utility/st_object";
import * as geometric from "geometric";

export abstract class StGeometic2D extends StUuidObject {
    /**
     * used by geometrics
     */
    abstract toArray(): Array<number | Array<number>>;

    abstract clone(): StGeometic2D;
}

/*
export class StSketchVector extends StGeometic2D {
	x: number;
	y: number;

	constructor(x?:number, y?:number) {
		super();
		this.x = x ? x: 0;
		this.y = y ? y: 0;
	}
	toVector2(){
		return new BABYLON.Vector2(this.x, this.y);
	}
	toArray() : geometric.Point {
		return [this.x, this.y];
	}
} */

class StSketchAxis {
    readonly X = new StSketchVector(1, 0);
    readonly Y = new StSketchVector(0, 1);
}

export const sketchAxis = new StSketchAxis();

export class StSketchVector extends StGeometic2D {
    static copyObj(p: StSketchVector): StSketchVector {
        return new StSketchVector(p.x, p.y);
    }

    static makeVector(p0: StPoint, p1: StPoint): StSketchVector {
        return new StSketchVector(p1.x - p0.x, p1.y - p0.y);
    }

    static makeVectorByLength(direct: StSketchVector, len: number): StSketchVector {
        const direct_len = direct.length();
        const x = (direct.x * len) / direct_len;
        const y = (direct.y * len) / direct_len;
        return new StSketchVector(x, y);
    }

    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    clone(): StSketchVector {
        return StSketchVector.copyObj(this);
    }

    /**
     * convert to BABYLON Vector2
     * @returns
     *
     * @deprecated DO NOT depend on BABYLON
     */
    toVector2(): BABYLON.Vector2 {
        return new BABYLON.Vector2(this.x, this.y);
    }

    toArray(): geometric.Point {
        return [this.x, this.y];
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y + this.y);
    }

    add(v: StSketchVector): StSketchVector {
        const vec = this.clone();
        vec.x += v.x;
        vec.y += v.y;
        return vec;
    }

    minus(v: StSketchVector): StSketchVector {
        const vec = this.clone();
        vec.x -= v.x;
        vec.y -= v.y;
        return vec;
    }
}

/**
 * A point is vector from (0, 0)
 */
export type StSketchPoint = StSketchVector;
export type StPoint = StSketchVector;

export class StSketchLine extends StGeometic2D {
    p0: StPoint;
    p1: StPoint;

    /**
     * Points are NOT cloned!!
     * So that, when a point changes, the line changes.
     */
    constructor(p0: StSketchVector, p1: StSketchVector) {
        super();
        //this.p0 = StSketchPoint.copyObj(p0);
        //this.p1 = StSketchPoint.copyObj(p1);
        this.p0 = p0;
        this.p1 = p1;
    }

    toArray(): geometric.Line {
        return [this.p0.toArray(), this.p1.toArray()];
    }

    clone(): StSketchLine {
        const p0 = this.p0.clone();
        const p1 = this.p1.clone();
        return new StSketchLine(p0, p1);
    }

    getVector(): StSketchVector {
        const p1 = this.p1;
        const p0 = this.p0;
        return new StSketchVector(p1.x - p0.x, p1.y - p0.y);
    }
}

export enum StPolygonOverlap {
    NONE,
    A_IN_B,
    B_IN_A,
    INTERSECT,
}

export class StEdgePoint extends StSketchVector {
    private offset: number;

    /**
     * Points are NOT cloned!!
     */
    constructor(p0: StSketchVector, offset: number) {
        super(p0.x, p0.y);
        this.offset = offset;
    }
}

/**
 * An edge on a polygon.
 */
export class StSketchEdge extends StSketchLine {
    private innerPoints: StEdgePoint[] = [];

    constructor(p0: StPoint, p1: StPoint) {
        super(p0, p1);
    }

    /**
     *
     * @param dist distance from the P0
     */
    addPoint(dist: number): void {
        const vec = this.getVector();
        const trans_vec = StSketchVector.makeVectorByLength(vec, dist);
        const pt = new StEdgePoint(this.p0.add(trans_vec), dist);
        this.innerPoints.push(pt);
    }
}

/**
 * A polygon, which is made of points and edges.
 */
export class StSketchPolygon extends StGeometic2D {
    static overlap(a: StSketchPolygon, b: StSketchPolygon): boolean {
        return StSketchPolygon.overlapType(a, b) != StPolygonOverlap.NONE;
    }

    static overlapType(a: StSketchPolygon, b: StSketchPolygon): StPolygonOverlap {
        const poly_a = a.toArray();
        const poly_b = b.toArray();

        if (geometric.polygonInPolygon(poly_a, poly_b)) {
            return StPolygonOverlap.A_IN_B;
        }
        if (geometric.polygonInPolygon(poly_b, poly_a)) {
            return StPolygonOverlap.B_IN_A;
        }
        if (geometric.polygonIntersectsPolygon(poly_a, poly_b)) {
            return StPolygonOverlap.INTERSECT;
        }
        return StPolygonOverlap.NONE;
    }

    static buildFromArray(arr: [number, number][]): StSketchPolygon {
        const ll: StSketchVector[] = [];
        for (const pt of arr) {
            ll.push(new StSketchVector(pt[0], pt[1]));
        }
        return new StSketchPolygon(ll);
    }

    readonly points: StPoint[] = [];
    readonly edges: StSketchEdge[] = [];

    constructor(points: StPoint[] ) {
        super();
        const cnt: number = points.length;
        if (cnt < 3) {
            throw Error("Polygon points must be more than 3!");
        }
        let pre: StSketchVector = points[cnt - 1];
        for (const p of points) {
            this.points.push(p.clone());
            this.edges.push(new StSketchEdge(pre, p));
            pre = p;
        }
    }

    clone(): StSketchPolygon {
        const pts: StSketchVector[] = [];
        for (const p of this.points) {
            pts.push(p.clone());
        }
        return new StSketchPolygon(pts);
    }

    /**
     * @deprecated make geometry independent of BABYLON
     */
    toVector2(): BABYLON.Vector2[] {
        const array = [];
        for (const p of this.points) {
            array.push(p.toVector2());
        }
        return array;
    }

    toArray(): geometric.Polygon {
        const gem_arr = [];
        for (const p of this.points) {
            gem_arr.push(p.toArray());
        }
        return gem_arr;
    }

    getPoint(idx: number): StPoint {
        const pt = this.points[idx];
        return new StSketchVector(pt.x, pt.y);
    }

    getStartPoint(): StPoint {
        return this.points[0];
    }

    overlap(b: StSketchPolygon): boolean {
        return StSketchPolygon.overlapType(this, b) != StPolygonOverlap.NONE;
    }

    translate(vec: StSketchVector): void {
        for (const p of this.points) {
            p.x += vec.x;
            p.y += vec.y;
        }
    }
}

/**
 * The 4 points of the sketch rectangle,
 * starting from LEFT-BOTTOM corner in counter-clock-wise.
 *
 *   	+-(rect[3])-------------+ rect[2]
 * 		|						|
 * 		|						|
 * 		|						|
 * 		|						|
 * 		|						|
 *   	+-(rect[0])-------------+ rect[1]
 */
export class StSketchRect extends StSketchPolygon {
    readonly a: number;
    readonly b: number;

    static buildRect(opt: { p0?: StPoint; width?: number; height?: number }): StSketchRect {
        const p0 = opt.p0 || new StSketchVector(0, 0);
        const width = opt.width || 2;
        const height = opt.height || 1;
        return this.buildRectByStartPoint(p0, width, height);
    }

    static buildRectByStartPoint(p0: StPoint, width: number, height: number): StSketchRect {
        console.debug("build sketch rectangle...");
        const p1 = new StSketchVector(p0.x + width, p0.y);
        const p2 = new StSketchVector(p0.x + width, p0.y + height);
        const p3 = new StSketchVector(p0.x, p0.y + height);
        const arr = [];
        arr.push(p0);
        arr.push(p1);
        arr.push(p2);
        arr.push(p3);
        return new StSketchRect(arr);
    }

    /**
     * order the rectangle pionts in counter-clock wise
     */
    static formulatePoints(points: StPoint[]): void {
        let min_x = points[0].x;
        let min_y = points[0].y;
        for (const p of points) {
            if (p.x < min_x) min_x = p.x;
            if (p.y < min_y) min_y = p.y;
        }
        // ...
        console.warn("todo: formulate the 4 ponits of the rectangle...");
    }

    private constructor(points: Array<StPoint>) {
        super(points);
        this.a = points[1].x - points[0].x;
        this.b = points[2].y - points[1].y;
    }

    toString(): string {
        const cls_name = this.constructor.name;
        return `[${cls_name}] start: ${this.getStartPoint()}, a:${this.a}, b:${this.b}`;
    }
}
