/**
 * @file    st_geometric_2d.ts
 * @author  guilin
 *
 * @description  geomitric 2d class
 *
 * ------------------ logs -----------------------------------------------------
 * [guilin 2021-7-21] created.
 *
 */

import { sketchUtil, StUuidObject } from "../utility/st_object";
import * as geometric from "geometric";
import { StVector } from "./st_vector_2d";

//import turf, { coordAll, FeatureCollection, Point } from "@turf/turf";
import turf from "@turf/turf";
import turfhelpers from "@turf/helpers";

export enum StPolygonOverlap {
    NONE,
    A_IN_B,
    B_IN_A,
    INTERSECT,
}

class StSketchAxis {
    readonly X = new StVector(1, 0);
    readonly Y = new StVector(0, 1);
}

export const sketchAxis = new StSketchAxis();

export abstract class StGeometic2D extends StUuidObject {
    /**
     * used by geometrics
     */
    abstract toArray(): Array<number | Array<number>>;

    abstract clone(): StGeometic2D;

    abstract translate(vec: StVector): void;
}

/**
 * DO NOT make x,y public!
 * Reason: (x,y) is changed in sub-class methods.
 */
export class StSketchPoint extends StGeometic2D {
    protected x: number;
    protected y: number;

    constructor(x?: number, y?: number) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    toArray(): geometric.Point {
        return [this.x, this.y];
    }

    clone(): StSketchPoint {
        return new StSketchPoint(this.x, this.y);
    }

    getVector(): StVector {
        return new StVector(this.x, this.y);
    }

    /**
     * convert to BABYLON Vector2
     * @returns
     *
     * @deprecated DO NOT depend on BABYLON
     */
    toBabylonVector2(): BABYLON.Vector2 {
        return new BABYLON.Vector2(this.x, this.y);
    }

    setPosition(pos: StVector): void {
        this.x = pos.x;
        this.y = pos.y;
    }

    translate(vec: StVector): void {
        this.x += vec.x;
        this.y += vec.y;
    }

    static makeVector(p0: StSketchPoint, p1: StSketchPoint): StVector {
        return new StVector(p1.x - p0.x, p1.y - p0.y);
    }
}

export class StEdgePoint extends StSketchPoint {
    private offset: number;
    readonly edgeId: string;

    /**
     * Points are NOT cloned!!
     */
    constructor(p0: StVector, offset: number, edge_id: string) {
        super(p0.x, p0.y);
        this.offset = offset;
        this.edgeId = edge_id;
    }

    setOffset(pos: StVector, offset: number): void {
        super.setPosition(pos);
        this.x = pos.x;
        this.y = pos.y;
        this.offset = offset;
    }
}

export class StSketchLine extends StGeometic2D {
    readonly vertex0: StSketchPoint;
    readonly vertex1: StSketchPoint;

    /**
     * Points are NOT cloned!!
     * So that, when a point changes, the line changes.
     */
    constructor(v0: StSketchPoint, v1: StSketchPoint) {
        super();
        //this.p0 = StSketchPoint.copyObj(p0);
        //this.p1 = StSketchPoint.copyObj(p1);
        this.vertex0 = v0;
        this.vertex1 = v1;
    }

    toArray(): geometric.Line {
        return [this.vertex0.toArray(), this.vertex1.toArray()];
    }

    clone(): StSketchLine {
        const p0 = this.vertex0.clone();
        const p1 = this.vertex1.clone();
        return new StSketchLine(p0, p1);
    }

    getVector(): StVector {
        const vec = [this.vertex0.getVector(), this.vertex1.getVector()];
        return vec[1].minus(vec[0]);
    }

    length(): number {
        return this.getVector().length();
    }

    translate(vec: StVector): void {
        this.vertex0.translate(vec);
        this.vertex1.translate(vec);
    }

    /**
     * Find the intersect point with the input line
     */
    intersectWith(line: StSketchLine): StSketchPoint | null {
        const line_a = this.toArray();
        const line_b = line.toArray();
        const lla = turfhelpers.lineString(line_a);
        const llb = turfhelpers.lineString(line_b);
        const seg_a = turf.lineSegment(lla);
        const seg_b = turf.lineSegment(llb);
        const collection: turf.FeatureCollection<turf.Point> = turf.lineIntersect(seg_a, seg_b);
        const pts = collection.features;
        if (pts.length > 1) {
            throw Error(`ERROR: More than ONE Intersect Point. Count: ${pts.length} `);
        }
        if (pts.length < 1) {
            return null;
        }
        const cord = pts[0].geometry.coordinates;
        return new StSketchPoint(cord[0], cord[1]);
    }
}

/**
 * An edge on a polygon.
 */
export class StSketchEdge extends StSketchLine {
    private innerPoints: StEdgePoint[] = [];

    constructor(p0: StSketchPoint, p1: StSketchPoint) {
        super(p0, p1);
    }

    /**
     * Add an inner point onto this edge
     *
     * @param offset distance from the starting vertex
     */
    addPoint(offset: number): StEdgePoint {
        const point_vec = this._calcInnerPoint(offset);
        const pt = new StEdgePoint(point_vec, offset, this.uuid);
        this.innerPoints.push(pt);
        console.warn("TODO: order the inner points by offset");
        return pt;
    }

    /**
     * move the inner point, by setting its offset(distance) from vertex-0;
     * @param point_id
     * @param offset
     */
    setPointOffset(point_id: string, offset: number): void {
        const p = this._getInnerPoint(point_id);
        const point_vec = this._calcInnerPoint(offset);
        p.setOffset(point_vec, offset);

        // TODO: send event to its polygon / division ??
    }

    deletePoint(point_id: string): void {
        const cnt = this.innerPoints.length;
        let idx = -1;
        for (let i = 0; i < cnt; i++) {
            const p = this.innerPoints[i];
            if (p.uuid == point_id) {
                idx = i;
            }
        }
        if (idx < 0) {
            throw Error(`Fail to find inner point on edge: ${point_id}`);
        }
        this.innerPoints.slice(idx, 1);

        // TODO: send event to its polygon / division ??
    }

    /**
     * calculate the position of the inner point
     */
    private _calcInnerPoint(offset: number): StVector {
        const line_len = this.length();
        if (offset <= 0 || line_len <= offset) {
            throw Error(`Point offset ${offset} out of boundary: (0, ${line_len})`);
        }
        const v0_vec = this.vertex0.getVector();
        const trans_vec = StVector.makeVectorByLength(this.getVector(), offset);
        return v0_vec.add(trans_vec);
    }

    private _getInnerPoint(id: string): StEdgePoint {
        for (const p of this.innerPoints) {
            if (p.uuid == id) return p;
        }
        throw Error(`Fail to find inner point on edge: ${id}`);
    }

    getInnerPoint(id: string): StEdgePoint | null {
        try {
            return this._getInnerPoint(id);
        } catch (e) {
            return null;
        }
    }
}

/**
 * A polygon, which is made of points and edges.
 *
 */
export class StSketchPolygon extends StGeometic2D {
    readonly vertices: StSketchPoint[] = [];
    readonly edges: StSketchEdge[] = [];

    constructor(points: StSketchPoint[]) {
        super();
        const cnt: number = points.length;
        if (cnt < 3) {
            throw Error("Polygon points must be more than 3!");
        }
        let pre: StSketchPoint = points[cnt - 1];
        for (const p of points) {
            // cook: do not clone the vertex point!
            //this.vertices.push(p.clone());
            this.vertices.push(p);
            this.edges.push(new StSketchEdge(pre, p));
            pre = p;
        }
    }

    clone(): StSketchPolygon {
        const pts: StSketchPoint[] = [];
        for (const p of this.vertices) {
            pts.push(p.clone());
        }
        return new StSketchPolygon(pts);
    }

    /**
     * @deprecated make geometry independent of BABYLON
     */
    toBabylonVector2(): BABYLON.Vector2[] {
        const array = [];
        for (const p of this.vertices) {
            array.push(p.toBabylonVector2());
        }
        return array;
    }

    toArray(): geometric.Polygon {
        const gem_arr = [];
        for (const p of this.vertices) {
            gem_arr.push(p.toArray());
        }
        return gem_arr;
    }

    /**
     * ATTENTION: changing the return point changes this polygon!!!
     * @param idx
     * @returns
     */
    getPoint(idx: number): StSketchPoint {
        return this.vertices[idx];
    }

    getStartPoint(): StSketchPoint {
        return this.vertices[0];
    }

    findEdge(edge_id: string): StSketchEdge | null {
        for (const e of this.edges) {
            if (edge_id == e.uuid) return e;
        }
        return null;
    }

    overlap(b: StSketchPolygon): boolean {
        return StSketchPolygon.overlapType(this, b) != StPolygonOverlap.NONE;
    }

    translate(vec: StVector): void {
        for (const p of this.vertices) {
            p.translate(vec);
        }
    }

    /**
     * Add an Edge-Point on the indexed edge.
     *
     * @param idx start from 0. index of the edges
     * @param offset
     */
    addEdgePointByIndex(idx: number, offset: number): StEdgePoint {
        const edge = this.edges[idx];
        return edge.addPoint(offset);
    }

    addEdgePointById(edge_id: string, offset: number): StEdgePoint {
        const [idx, edge] = this._getEdgeById(edge_id);
        return edge.addPoint(offset);
    }

    private _getEdgeById(edge_id: string): [number, StSketchEdge] {
        let idx = -1;
        for (const e of this.edges) {
            idx++;
            if (e.uuid == edge_id) {
                return [idx, e];
            }
        }
        throw Error(`Fail to get Edge by ID: ${edge_id}`);
    }

    private _getNextEdge(edge_id: string): [number, StSketchEdge] {
        let [idx] = this._getEdgeById(edge_id);
        if (idx == this.edges.length) {
            idx = 0;
        } else {
            idx++;
        }
        return [idx, this.edges[idx]];
    }

    /**
     * Find the edge, which the input point belongs to
     * @param point_id
     * @returns
     */
    private _getEdgeByPoint(point_id: string): [number, StSketchEdge] {
        let edge: StSketchEdge | undefined;
        let idx = -1;
        for (const e of this.edges) {
            idx++;
            if (e.getInnerPoint(point_id) != null) {
                edge = e;
                break;
            }
        }
        if (!edge) {
            throw Error(`Fail to find home edge by point ${point_id}`);
        }
        return [idx, edge];
    }

    /**
     * Divide polygon by 2 edge-points, which can be found on one of the edges in this polygon.
     *
     * @param p0  point on polygon edge
     * @param p1  point on polygon edge
     * @returns
     */
    divideByPoints(p0: StEdgePoint, p1: StEdgePoint): StSketchPolygon[] {
        const [idx0, e0] = this._getEdgeByPoint(p0.uuid);
        const [idx1, e1] = this._getEdgeByPoint(p1.uuid);
        if (idx0 == idx1) {
            throw Error(`Points on same Edge: ${p0}, ${p1}`);
        }
        return [this._createChild(e0, p0, p1, e1), this._createChild(e1, p1, p0, e0)];
    }

    private _createChild(e0: StSketchEdge, p0: StEdgePoint, p1: StEdgePoint, e1: StSketchEdge): StSketchPolygon {
        const pt_arr: StSketchPoint[] = [];
        pt_arr.push(p0, p1);
        let edge = e1;
        for (; edge != e0; ) {
            pt_arr.push(edge.vertex1);
            [, edge] = this._getNextEdge(edge.uuid);
        }
        return new StSketchPolygon(pt_arr);
    }

    /*
    private _divideByOrderedPoints22(opt: {pt: StEdgePoint, idx: number, edge: StSketchEdge}[]): StSketchPolygon[] {
        const pt_arr1: StSketchPoint[] = [];
        const pt_arr2: StSketchPoint[] = [];
        const divide_edge = new StSketchEdge(opt[0].pt, opt[1].pt);

        pt_arr1.push(opt[0].pt);
        pt_arr1.push(opt[1].pt);
        
        let edge = opt[1].edge;
        for(; edge != opt[0].edge; ){
            pt_arr1.push(edge.vertex1);
            [, edge] = this._getNextEdge(edge.uuid);
        }
        const poly1 = new StSketchPolygon(pt_arr1);

        pt_arr2.push(opt[1].pt);
        pt_arr2.push(opt[0].pt);
        edge = opt[0].edge;
        for(; edge != opt[1].edge; ){
            pt_arr2.push(edge.vertex1);
            [, edge] = this._getNextEdge(edge.uuid);
        }
        const poly2 = new StSketchPolygon(pt_arr1);

        // TODO
    } */

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

    private constructor(points: Array<StSketchPoint>) {
        super(points);
        const v0 = StSketchPoint.makeVector(points[1], points[0]);
        const v1 = StSketchPoint.makeVector(points[2], points[1]);
        this.a = v0.length();
        this.b = v1.length();
    }

    toString(): string {
        const cls_name = this.constructor.name;
        return `[${cls_name}] start: ${this.getStartPoint()}, a:${this.a}, b:${this.b}`;
    }

    static buildRect(opt: { p0?: StSketchPoint; width?: number; height?: number }): StSketchRect {
        const p0 = opt.p0 || new StSketchPoint(0, 0);
        const width = opt.width || 2;
        const height = opt.height || 1;
        return this.buildRectByStartPoint(p0, width, height);
    }

    static buildRectByStartPoint(p0: StSketchPoint, width: number, height: number): StSketchRect {
        console.debug("build sketch rectangle...");
        const [x, y] = p0.toArray();
        const p1 = new StSketchPoint(x + width, y);
        const p2 = new StSketchPoint(x + width, y + height);
        const p3 = new StSketchPoint(x, y + height);
        const arr = [];
        arr.push(p0);
        arr.push(p1);
        arr.push(p2);
        arr.push(p3);
        return new StSketchRect(arr);
    }

    // /**
    //  * order the rectangle pionts in counter-clock wise
    //  */
    // static formulatePoints(points: StSketchPoint[]): void {
    //     let min_x = points[0].x;
    //     let min_y = points[0].y;
    //     for (const p of points) {
    //         if (p.x < min_x) min_x = p.x;
    //         if (p.y < min_y) min_y = p.y;
    //     }
    //     // ...
    //     console.warn("todo: formulate the 4 ponits of the rectangle...");
    // }
}
