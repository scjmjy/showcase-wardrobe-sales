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

import { StObject } from "../utility/st_object";
import * as geometric from "geometric";

export abstract class StGeometic2D extends StObject {
    /**
     * used by geometrics
     */
    abstract toArray(): Array<number | Array<number>>;
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

export class StSketchPoint extends StGeometic2D {
    static copyObj(p: StSketchPoint): StSketchPoint {
        return new StSketchPoint(p.x, p.y);
    }

    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
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
}

export type StSketchVector = StSketchPoint;

export class StSketchLine extends StGeometic2D {
    p0: StSketchPoint;
    p1: StSketchPoint;

    constructor(p0: StSketchPoint, p1: StSketchPoint) {
        super();
        this.p0 = StSketchPoint.copyObj(p0);
        this.p1 = StSketchPoint.copyObj(p1);
    }

    toArray(): geometric.Line {
        return [this.p0.toArray(), this.p1.toArray()];
    }
}

export enum StPolygonOverlap {
    NONE,
    A_IN_B,
    B_IN_A,
    INTERSECT,
}

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
        const ll: StSketchPoint[] = [];
        for (const pt of arr) {
            ll.push(new StSketchPoint(pt[0], pt[1]));
        }
        return new StSketchPolygon(ll);
    }

    readonly list: Array<StSketchPoint> = [];

    constructor(points: Array<StSketchPoint>) {
        super();
        for (const p of points) {
            this.list.push(StSketchPoint.copyObj(p));
        }
    }

    toVector2(): BABYLON.Vector2[] {
        const array = [];
        for (const p of this.list) {
            array.push(p.toVector2());
        }
        return array;
    }

    toArray(): geometric.Polygon {
        const gem_arr = [];
        for (const p of this.list) {
            gem_arr.push(p.toArray());
        }
        return gem_arr;
    }

    getPoint(idx: number): StSketchPoint {
        const pt = this.list[idx];
        return new StSketchPoint(pt.x, pt.y);
    }

    getStartPoint(): StSketchPoint {
        return this.list[0];
    }

    overlap(b: StSketchPolygon): boolean {
        return StSketchPolygon.overlapType(this, b) != StPolygonOverlap.NONE;
    }

    translate(vec: StSketchVector): void {
        for (const p of this.list) {
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

    static buildRectByStartPoint(p0: StSketchPoint, width: number, height: number): StSketchRect {
        console.debug("build sketch rectangle...");
        const p1 = new StSketchPoint(p0.x + width, p0.y);
        const p2 = new StSketchPoint(p0.x + width, p0.y + height);
        const p3 = new StSketchPoint(p0.x, p0.y + height);
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
    static formulatePoints(points: Array<StSketchPoint>): void {
        let min_x = points[0].x;
        let min_y = points[0].y;
        for (const p of points) {
            if (p.x < min_x) min_x = p.x;
            if (p.y < min_y) min_y = p.y;
        }
        // ...
        console.warn("todo: formulate the 4 ponits of the rectangle...");
    }

    private constructor(points: Array<StSketchPoint>) {
        super(points);
        this.a = points[1].x - points[0].x;
        this.b = points[2].y - points[1].y;
    }

    toString(): string {
        const cls_name = this.constructor.name;
        return `[${cls_name}] start: ${this.getStartPoint()}, a:${this.a}, b:${this.b}`;
    }
}
