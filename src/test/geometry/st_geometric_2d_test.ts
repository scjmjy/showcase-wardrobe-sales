import { StSketchEdge, StSketchPoint } from "@/lib/geometry/st_geometric_2d";

class StSketchEdgeTest {
    intersect01(){
        const p00  = new StSketchPoint(0,  0);
        const p01  = new StSketchPoint(0, 10);
        const e0 = new StSketchEdge(p00, p01);
        
        const p0 = e0.addPoint(3);
        const p1 = new StSketchPoint(3, 100);
        const edge = new StSketchEdge(p0, p1);
        
        const p10  = new StSketchPoint(10, 6);
        const p11  = new StSketchPoint(0,  6);
        const e1   = new StSketchEdge(p10, p11);

        const intersect_point = edge.intersectWith(e1);
        
        console.log(`Intersect Point: ${intersect_point}`);
    }
}


class StSketchPolygonTest {
    divide01_byEdgePoints() {
        throw Error("TODO");
    }

    divide02_byCrossLine() {
        throw Error("TODO");
    }
}

export const edgeTest = new StSketchEdgeTest();

export const polygonTest = new StSketchPolygonTest();