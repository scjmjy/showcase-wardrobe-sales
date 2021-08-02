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

import { StPoint, StSketchEdge, StSketchVector, StSketchPolygon } from "./st_geometric_2d";

/**
 * A polygon area can be divided into several polygons
 */
export class StPolygonArea extends StSketchPolygon {
    private readonly divideEdges: StSketchEdge[] = [];
    private readonly dividedPolygons: StSketchPolygon[] = [];

    /**
     * Add an edge and divide the (sub)area into 2 polygons.
     * @param p0
     * @param p1
     */
    divideByPoints(p0: StPoint, p1: StPoint): StSketchEdge {
        throw Error("TODO");
    }

    deleteEdge(edge_id: string): void {
        throw Error("TODO");
    }

    moveEdge(edge_id: string, vec: StSketchVector, offset: number): void {
        throw Error("TODO");
    }

    getDivideEdge(edge_id: string): StSketchEdge | null {
        for (const e of this.divideEdges) {
            if (e.uuid == edge_id) {
                return e;
            }
        }
        return null;
    }
}
