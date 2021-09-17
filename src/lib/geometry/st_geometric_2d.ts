/**
 * @file    st_geometric_2d.ts
 * @author  guilin
 *
 * @description  geomitric 2d class
 *
 * ------------------ logs -----------------------------------------------------
 * [guilin 2021-7-21] created.
 *
 * [Guilin 2021-08-18] A polygon is divided with turf;
 *
 */

import { sketchUtil, StUuidObject } from "../utility/st_object";
import { StVector } from "./st_vector_2d";
import * as geometric from "geometric";
import * as turf from "@turf/turf";
import stringify from "json-stringify-pretty-compact";
import { jsonIgnoreReplacer } from "json-ignore";
import StSketchConstant from "../utility/st_sketch_constant";

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
     * used by lib 'geometrics'
     */
    abstract toArray(): Array<number | Array<number>>;

    abstract clone(): StGeometic2D;

    abstract translate(vec: StVector): void;

    /**
     * TRUE if the geomertic object has the same coordinates
     * @param geo
     */
    abstract valueEquals(geo: StGeometic2D): boolean;
}

/**
 * DO NOT make x,y public!
 * Reason: (x, y) may be changed in sub-class methods. e.g. StEdgePoint.setOffset()
 *
 * Call StSketchPoint.getVector() to access its (x, y)
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

    distanceToPoint(p1: StSketchPoint): number {
        const v0 = this.getVector();
        const v1 = p1.getVector();
        const vec = v1.minus(v0);
        return vec.length();
    }

    overlaps(p1: StSketchPoint): boolean {
        return this.x == p1.x && this.y == p1.y;
    }

    valueEquals(pt: StSketchPoint): boolean {
        return this.x == pt.x && this.y == pt.y;
    }

    toFixed(digits?: number): StSketchPoint {
        this.x = sketchUtil.toFixed(this.x, digits);
        this.y = sketchUtil.toFixed(this.y, digits);
        return this;
    }

    static buildFromVector(v: StVector): StSketchPoint {
        return new StSketchPoint(v.x, v.y);
    }

    static makeVector(p0: StSketchPoint, p1: StSketchPoint): StVector {
        return new StVector(p1.x - p0.x, p1.y - p0.y);
    }

    static orderPoints(pt_arr: StSketchPoint[]): StSketchPoint[] {
        const cnt = pt_arr.length;
        let min: [number, StVector] = [0, pt_arr[0].getVector()];
        for (let i = 1; i < cnt; i++) {
            const p = pt_arr[i].getVector();
            if (p.x <= min[1].x && p.y <= min[1].y) {
                min = [i, p];
            }
        }
        //console.log(`## find LEFT-BOTTOM: ${min}`);
        const pt_arr2: StSketchPoint[] = [];
        for (let i = 0; i < cnt; i++) {
            const idx = (i + min[0]) % cnt;
            const pt = pt_arr[idx];
            pt_arr2.push(pt);
        }
        //console.log(`## ordered points: ${pt_arr2}`);
        return pt_arr2;
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

    getOffset(): number {
        return this.offset;
    }

    valueEquals(pt: StEdgePoint): boolean {
        return super.valueEquals(pt) && this.offset == pt.offset && this.edgeId == pt.edgeId;
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
        this.vertex0 = v0;
        this.vertex1 = v1;
    }

    valueEquals(line: StSketchLine): boolean {
        return this.vertex0.valueEquals(line.vertex0) && this.vertex1.valueEquals(line.vertex1);
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
        const lla = turf.lineString(line_a);
        const llb = turf.lineString(line_b);
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
        return new StSketchPoint(cord[0], cord[1]).toFixed(4);
    }

    static buildByArray(arr: geometric.Line): StSketchLine {
        return new StSketchLine(new StSketchPoint(arr[0][0], arr[0][1]), new StSketchPoint(arr[1][0], arr[1][1]));
    }
}

/**
 * An edge on a polygon.
 */
export class StSketchEdge extends StSketchLine {
    static buildByArray(arr: geometric.Line): StSketchEdge {
        return new StSketchEdge(new StSketchPoint(arr[0][0], arr[0][1]), new StSketchPoint(arr[1][0], arr[1][1]));
    }

    private innerPoints: StEdgePoint[] = [];

    constructor(p0: StSketchPoint, p1: StSketchPoint) {
        super(p0, p1);
    }

    valueEquals(edge: StSketchEdge): boolean {
        if (super.valueEquals(edge)) {
            if (this.innerPoints.length == edge.innerPoints.length) {
                const cnt = this.innerPoints.length;
                for (let i = 0; i < cnt; i++) {
                    const p0 = this.innerPoints[i];
                    const p1 = edge.innerPoints[i];
                    if (!p0.valueEquals(p1)) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
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
        this.innerPoints.sort((a, b) => {
            return sketchUtil.numberCompare(a.getOffset(), b.getOffset());
        });
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
        if (offset < 0 || line_len < offset) {
            throw Error(`Point offset ${offset} out of boundary: (0, ${line_len})`);
        }
        if (offset == 0) {
            return new StVector(0, 0);
        }
        const v0_vec = this.vertex0.getVector();
        const trans_vec = StVector.makeVectorByLength(this.getVector(), offset);
        return v0_vec.add(trans_vec).toFixed();
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

    /**
     * If success, an edge-point(EP) on current edge is returned, which has an offset from this.vertex0;
     * if EP.offset== 0,             it overlaps with this.vertex0;
     * if EP.offset== this.length(), it overlaps with this.vertex1;
     *
     *
     * @param line
     * @returns
     *
     */
    intersectWith(line: StSketchLine): StEdgePoint | null {
        const pt = super.intersectWith(line);
        if (pt == null) {
            return null;
        }
        const offset = pt.distanceToPoint(this.vertex0);
        const edge_pt = this.addPoint(offset);
        return edge_pt;
    }

    /**
     *
     * If the edge moves(translates), its inner points must be updated!
     */
    translate(vec: StVector) {
        super.translate(vec);
        // Recalculate the inner-pointer positions according to edges.
        for (const p of this.innerPoints) {
            const offset = p.getOffset();
            const pt = this._calcInnerPoint(offset);
            p.setOffset(pt, offset);
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

        for (let i = 0; i < cnt; i++) {
            const p = points[i];
            // NOTE: do not clone the vertex point!
            // this.vertices.push(p.clone());
            this.vertices.push(p);

            let idx_next = i + 1;
            if (idx_next >= cnt) {
                idx_next = 0;
            }
            const p_next = points[idx_next];
            this.edges.push(new StSketchEdge(p, p_next));
        }
    }

    valueEquals(poly: StSketchPolygon): boolean {
        // NOTE: currently, DO NOT check edges
        const cnt = this.vertices.length;
        if (cnt == poly.vertices.length) {
            for (let i = 0; i < cnt; i++) {
                const p0 = this.vertices[i];
                const p1 = poly.vertices[i];
                if (!p0.valueEquals(p1)) {
                    return false;
                }
            }
            return true;
        }
        return false;
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

    getPosition(idx: number): StVector {
        return this.vertices[idx].getVector();
    }

    /**
     * [Guilin 8-19] Maybe, call getStartPosition() to return a vector is better.
     */
    getStartPoint(): StSketchPoint {
        return this.vertices[0];
    }

    getStartPosition(): StVector {
        return this.vertices[0].getVector();
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
        idx++;
        if (idx == this.edges.length) {
            idx = 0;
        }
        const edge = this.edges[idx];
        if (!edge) throw Error(`Fail to find edge by index: ${idx}`);
        return [idx, edge];
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

    divideByLine(line: StSketchLine): StSketchPolygon[] {
        console.debug(`divide by line ${line}`);
        const polys: StSketchPolygon[] = [];
        const pts: StEdgePoint[] = [];
        const edges: StSketchEdge[] = [];
        for (const edge of this.edges) {
            const p: StEdgePoint | null = edge.intersectWith(line);
            if (p != null) {
                pts.push(p);
                edges.push(edge);
            }
        }
        if (edges.length == 2) {
            polys.push(this._createChild(edges[0], pts[0], pts[1], edges[1]));
            polys.push(this._createChild(edges[1], pts[1], pts[0], edges[0]));
        } else if (edges.length < 2) {
            console.debug(`line ${line} fails to divide rect ${this}`);
        } else {
            throw Error(`Fatal: ${edges.length}`);
        }
        return polys;
    }

    /**
     * input edges and points (e0, p0, p1, e1) are in counter-clock wise.
     * @param e0
     * @param p0
     * @param p1
     * @param e1
     * @returns
     */
    private _createChild(e0: StSketchEdge, p0: StEdgePoint, p1: StEdgePoint, e1: StSketchEdge): StSketchPolygon {
        const pt_arr: StSketchPoint[] = [];
        pt_arr.push(p0, p1);
        let edge = e1;
        for (; edge != e0; ) {
            //console.debug(`## process edge: ${edge}`);
            pt_arr.push(edge.vertex1);
            [, edge] = this._getNextEdge(edge.uuid);
        }
        // order the points: the 1st point is at the LEFT-BOTTOM corner
        const array2: StSketchPoint[] = StSketchPoint.orderPoints(pt_arr);
        return new StSketchPolygon(array2);
    }

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

    valueEquals(rect: StSketchRect): boolean {
        return super.valueEquals(rect) && this.a == rect.a && this.b == rect.b;
    }

    toString(max_len?: number, simple?: boolean): string {
        // return super.toString(max_len, simple);
        const vv = { vertices: this.vertices };
        return stringify(vv, {
            maxLength: max_len || 256,
            replacer: jsonIgnoreReplacer,
        });
    }

    /*
     * [Guiln: 2021-8-11] If a line divides a rectangle, the children may NOT be rectangles.
     * 
    divideByLine(line: StSketchLine): StSketchRect[] {
        const rects: StSketchRect[] = [];
        const poly = super.divideByLine(line);
        if(poly.length == 2){
            rects.push(new StSketchRect(poly[0].vertices));;
            rects.push(new StSketchRect(poly[1].vertices));;
        }
        return rects;
    }
    */

    static buildRect(opt: { p0?: StSketchPoint; width?: number; height?: number }): StSketchRect {
        const p0 = opt.p0 || new StSketchPoint(0, 0);
        const width = opt.width || 2;
        const height = opt.height || 1;
        return this.buildRectByStartPoint(p0, width, height);
    }

    /**
     *  build a rectangle at the left side of the input line.
     *
     *   -------- o   vertex1
     *   |       /|\
     *   | Rect   |
     *   |        |----\
     *   |        |     \ line
     *   |        |
     *   |        |
     *   |_______ o   vertex0
     *
     *
     * @param line
     * @param thickness
     * @returns
     */
    static buildRectByLineAtLeft(line: StSketchLine, thickness: number): StSketchRect {
        const v0 = line.getVector();
        const v1 = v0.rotate(Math.PI / 2);
        v1.setLength(thickness).toFixed();

        const p2 = line.vertex1.clone();
        const p3 = line.vertex0.clone();
        p2.translate(v1);
        p3.translate(v1);

        const pts: StSketchPoint[] = [];
        pts.push(line.vertex0);
        pts.push(line.vertex1);
        pts.push(p2);
        pts.push(p3);
        const arr = StSketchPoint.orderPoints(pts);
        return new StSketchRect(arr);
    }

    static buildByPolygon(poly: StSketchPolygon): StSketchRect {
        const pts = poly.vertices;
        if (pts.length != 4) {
            throw Error(`Vertices Number is NOT 4! count: ${pts.length}`);
        }
        const edges = poly.edges;
        const angles: number[] = [
            edges[0].getVector().angle(),
            edges[1].getVector().angle(),
            edges[2].getVector().angle(),
            edges[3].getVector().angle(),
        ];

        if (angles[0] == 0 && angles[1] == 90 && angles[2] == 180 && angles[3] == 270) {
            return new StSketchRect(poly.vertices);
        }
        throw Error(`Angles of the 4 Edges are not correct: ${angles}`);
    }

    static buildRectByStartPoint(p0: StSketchPoint, width: number, height: number): StSketchRect {
        // console.debug("build sketch rectangle...");
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

    /**
     * NOTE: All points in result rectangle are created from scatch.
     *
     * @param host
     * @param occupied
     * @param part_size
     * @param opt
     * @returns
     */
    static calcAvailableRect(
        host: StSketchRect,
        occupied: StSketchRect[],
        part_size: StVector,
        opt?: {
            minHeight?: number;
            // left, bottom, right, top
            margins?: [number, number, number, number];
        },
    ): StSketchRect[] {
        // console.log(`## host rect: ${host}, \n occupied: ${occupied}, \n part_size: ${part_size}`);
        const width = host.a;
        const min_height = opt?.minHeight || StSketchConstant.MIN_DIVISION_HEIGHT_M;
        const margins = opt?.margins || [0.04, 0.06, 0.04, 0.06];
        const fixed_rects: StSketchRect[] = [];
        if (width < part_size.x) {
            console.log(`host width is too small: ${width} mm`);
            return [];
        }
        if (width > 1.5 * part_size.x) {
            console.log(`host width is too large: ${width} mm`);
            return [];
        }
        occupied.forEach((e) => {
            fixed_rects.push(e);
        });
        // [Cook: 2021-7-19 ] add the last LOGICAL 'rectangle' whose height is ZERO, to calculate the top SPACE in the following for loop
        fixed_rects.push(StSketchRect.buildRectByStartPoint(host.getPoint(3), host.a, 0));

        fixed_rects.sort((n1, n2) => {
            const v1 = n1.getStartPosition();
            const v2 = n2.getStartPosition();
            if (v1.y > v2.y) return 1;
            if (v1.y < v2.y) return -1;
            return 0;
        });

        // console.log(`## fixed rectangles (sorted): ${fixed_rects}`);
        const array: StSketchRect[] = [];
        let start_pt = host.getStartPosition();
        for (const fixed_rect of fixed_rects) {
            const height = fixed_rect.getStartPosition().y - start_pt.y;
            if (height > min_height && height > part_size.y) {
                const x = start_pt.x + margins[0];
                const y = start_pt.y + margins[1];
                const w = width - margins[0] - margins[2];
                const h = height - margins[1] - margins[3];
                const rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(x, y), w, h);
                array.push(rect);
            }
            start_pt = fixed_rect.getPoint(3).getVector();
        }
        // console.log(`find available rects: cnt: ${array.length}  ----\n ${array}`);
        return array;
    }
}
