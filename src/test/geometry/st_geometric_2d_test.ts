import { StSketchEdge, StSketchPoint } from "@/lib/geometry/st_geometric_2d";
import { UtilityLayerRenderer } from "babylonjs/Rendering/utilityLayerRenderer";

export class StSketchTest {
    assertTrue(v: boolean, msg?: string): void {
        if(! v) {
            throw Error(`[Failure] ${msg}`);
        }
    }

    assertValid<T>(v: T|undefined|null, msg?: string): T {
        if(v == undefined ) {
            throw Error(`[Failure] value is undefined. -- ${msg}`);
        }
        if( v == null) {
            throw Error(`[Failure] value is null . -- ${msg}`);
        }
        return v;
    }

    assertEqual<T>(result: T, expected: T, msg?: string): void {
        if(result != expected)  {
            throw Error(`[Failure] Expected: ${expected}, Result: ${result} -- ${msg} `);
        }
    }
}


class StSketchEdgeTest extends StSketchTest { 
    intersect01(): string {
        const p00  = new StSketchPoint(0,  0);
        const p01  = new StSketchPoint(10, 0);
        const e0 = new StSketchEdge(p00, p01);
        
        const p0 = e0.addPoint(3);
        const p1 = new StSketchPoint(3, 100);
        const edge = new StSketchEdge(p0, p1);
        
        const p10  = new StSketchPoint(10, 6);
        const p11  = new StSketchPoint(0,  6);
        const e1   = new StSketchEdge(p10, p11);

        const intersect_point: StSketchPoint| null = edge.intersectWith(e1);
        const intersect: StSketchPoint = this.assertValid(intersect_point);
        console.log(`edge: ${edge}, e1: ${e1} `);
        console.log(`Intersecting Point: ${intersect}`);
        this.assertEqual(intersect.x, 3 );
        this.assertEqual(intersect.y, 6 );
        return intersect.toString();
    }

    intersect02(): string {
        const p00  = new StSketchPoint(0,  0);
        const p01  = new StSketchPoint(10, 0);
        const e0 = new StSketchEdge(p00, p01);
        
        const p0 = e0.addPoint(3);
        const p1 = new StSketchPoint(3, 1);
        const edge = new StSketchEdge(p0, p1);
        
        const p10  = new StSketchPoint(10, 6);
        const p11  = new StSketchPoint(0,  6);
        const e1   = new StSketchEdge(p10, p11);

        const intersect_point: StSketchPoint| null = edge.intersectWith(e1);
        this.assertTrue(intersect_point == null);

        return "NO Intersection !!!"
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