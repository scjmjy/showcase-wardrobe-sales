/**
 * @file    st_polygon_area_2d.ts
 * @author  Guilin
 *
 * @description  Geomitric 2D class
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-21] Created.
 *
 */

import { StSketchPoint, StSketchEdge, StSketchPolygon, StEdgePoint, StSketchLine } from "./st_geometric_2d";
import { StVector } from "./st_vector_2d";

export class StDivideLine extends StSketchLine {}

/**
 * A polygon area can be divided into several small polygons
 *
 * @deprecated by StPolygon and StSketchContainer
 */
export class StPolygonArea extends StSketchPolygon {
    /**
     * the lines that divide the outer polygon.
     *
     * Each line has 2 edges, at least.
     *
     * The starting and ending points of a dividing line is either on the original polygon edge or another dividing edge.
     */
    private readonly divideEdges: StSketchEdge[] = [];
    //private readonly divideLines: StSketchLine[] = [];

    /**
     *
     */
    private readonly dividedPolygons: StSketchPolygon[] = [];

    constructor(points: StSketchPoint[]) {
        super(points);
        const poly = super.clone();
        this.dividedPolygons.push(poly);
        for (const edge of poly.edges) {
            this.divideEdges.push(edge);
        }
    }

    addPointOnDivideEdge(edge_id: string, offset: number): StEdgePoint {
        const edge = this._getDivideEdgeById(edge_id);
        return edge.addPoint(offset);
    }

    /**
     * Add an edge and divide the (sub)polygon into 2 smaller polygons.
     *
     * The 2 points must be on different edges of the polygon or its sub-polygon.
     * @param p0
     * @param p1
     */
    divideByLine(p0: StEdgePoint, p1: StEdgePoint): StSketchEdge {
        const divide_edge = new StSketchEdge(p0, p1);

        // find the edge, which p0/p1 belongs to
        const e0 = this._getHomeEdgeByPoint(p0.uuid);
        const e1 = this._getHomeEdgeByPoint(p1.uuid);

        // find the polygon, which above edges belongs to
        // [Guilin: 2021-8-3] TODO: process edges on different divide polygons
        const [idx, home_ploygon] = this._findPolygonByEdges([e0, e1]);
        const children = home_ploygon.divideByPoints(p0, p1);

        // TODO:
        // 1. delete the home polygon
        // 2. add the 2 new polygons;
        this.dividedPolygons.slice(idx, 1);
        this.dividedPolygons.push(children[0], children[1]);

        throw Error("TODO");
    }

    deleteEdge(edge_id: string): void {
        throw Error("TODO");
    }

    /**
     * [Theodore: 2021-08-03] if the polygon is NOT a rectangle, moving an edge alone a vector is very complicated.
     *
     * @param edge_id
     * @param vec
     * @param offset
     *
     * @deprecated WILL NOT implement in v 1.0!
     */
    moveEdge_22(edge_id: string, vec: StVector, offset: number): number {
        throw Error("WILL NOT implement in v 1.0");
    }

    /**
     * Move the point along the home edge, NOT the divide-edge that this point behaves as vertex.
     *
     *
     *
     * @param point_id ID of a point on edge. The point is either on the original polygon edge or the dividing edge.
     * @param offset offset from the starting vertex of the home edge.
     */
    moveEdgePoint(point_id: string, offset: number): void {
        const home_edge = this._getHomeEdgeByPoint(point_id);
        home_edge.setPointOffset(point_id, offset);
    }

    private _findPolygonByEdges(edges: StSketchEdge[]): [number, StSketchPolygon] {
        const edge_cnt = edges.length;
        if (edge_cnt < 2) {
            throw Error(`>=2 edges are required. Current: ${edge_cnt}`);
        }
        let idx = -1;
        for (const p of this.dividedPolygons) {
            idx++;
            let cnt = 0;
            for (const e of edges) {
                if (p.findEdge(e.uuid) == null) {
                    // abort, if any edge is NOT on current polygon
                    break;
                }
                cnt++;
            }
            if (cnt == edge_cnt) {
                return [idx, p];
            }
        }
        throw Error(`Fail to find Ploygon by ${edge_cnt} edges`);
    }

    private _getDivideEdgeById(edge_id: string): StSketchEdge {
        for (const e of this.divideEdges) {
            if (e.uuid == edge_id) {
                return e;
            }
        }
        throw Error(`Fail to get Edge by ID: ${edge_id}`);
    }

    private _getEdgeDividePolygons(edge_id: string): StSketchPolygon[] {
        const polygons: StSketchPolygon[] = [];
        for (const p of this.dividedPolygons) {
            for (const e of p.edges) {
                if (e.uuid == edge_id) {
                    polygons.push(p);
                    break;
                }
            }
        }
        return polygons;
    }

    private _getHomeEdgeByPoint(point_id: string): StSketchEdge {
        let edge: StSketchEdge | undefined;
        for (const e of this.divideEdges) {
            if (e.getInnerPoint(point_id) != null) {
                edge = e;
                break;
            }
        }
        if (!edge) {
            throw Error(`Fail to find home edge by point ${point_id}`);
        }
        return edge;
    }

    private _getDivideEdgeByVertex(vertex_id: string): StSketchEdge {
        for (const e of this.divideEdges) {
            if (e.vertex0.uuid == vertex_id || e.vertex1.uuid == vertex_id) {
                return e;
            }
        }
        throw Error(`Fail to get Edge by Point ID: ${vertex_id}`);
    }
}
