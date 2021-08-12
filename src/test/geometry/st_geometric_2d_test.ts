import { StSketchEdge, StSketchLine, StSketchPoint, StSketchRect } from "@/lib/geometry/st_geometric_2d";
import { StVector } from "@/lib/geometry/st_vector_2d";
import { StringDictionary } from "babylonjs/Legacy/legacy";
import { UtilityLayerRenderer } from "babylonjs/Rendering/utilityLayerRenderer";
import { StSketchTest } from "./st_sketch_test";

class StSketchEdgeTest extends StSketchTest { 
    /**
     * A simple intersection: Edges cross.
     * 
     * edge: (3,0), (3,100)
     * e1:   (10,6), (0, 6)
     * 
     * intersection: (3,6)
     */
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
        const intersect: StVector = this.assertValid(intersect_point).getVector();
        console.log(`edge: ${edge}, e1: ${e1} `);
        console.log(`Intersecting Point: ${intersect}`);
        this.assertEqual(intersect.x, 3 );
        this.assertEqual(intersect.y, 6 );
        //return intersect.toString();
        return `Intersection Point: ${intersect}`;
    }

    /**
     * NO intersection. 
     * 
     * edge: (3,0), (3, 1)
     * e1:   (10,6), (0, 6)
     * 
     * intersection: NULL
     */
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


    /**
     * Intersection on one edge
     * 
     * edge: (3,0), (4, 6)
     * e1:   (10,6), (0, 6)
     * 
     * intersection: (4, 6)
     */
    intersect03(): string {
        const p00  = new StSketchPoint(0,  0);
        const p01  = new StSketchPoint(10, 0);
        const e0 = new StSketchEdge(p00, p01);
        
        const p0 = e0.addPoint(3);
        const p1 = new StSketchPoint(4, 6);
        const edge = new StSketchEdge(p0, p1);
        
        const p10  = new StSketchPoint(10, 6);
        const p11  = new StSketchPoint(0,  6);
        const e1   = new StSketchEdge(p10, p11);

        const intersect_point: StSketchPoint| null = edge.intersectWith(e1);
        const intersect: StVector = this.assertValid(intersect_point).getVector();
        console.log(`edge: ${edge}, e1: ${e1} `);
        console.log(`Intersecting Point: ${intersect}`);
        this.assertEqual(intersect.x, 4 );
        this.assertEqual(intersect.y, 6 );
        return `Intersection Point: ${intersect}`;
    }

}


class StSketchPolygonTest extends StSketchTest {
    divide01_byEdgePoints() {
        throw Error("TODO");
    }

   /** 
    *   	+-(10, 15) -------------+ (20, 15)
    * 		|						|
    * 		|						|
    * 		|						|
    * 		|						|
    * 		|						|
    *   	+-(10, 10) -------------+ (20, 10)
    */
    divide02_byCrossLine(): string {
        const pts: StSketchPoint[] = [];
        pts.push(new StSketchPoint(10,10));
        pts.push(new StSketchPoint(20,10));
        pts.push(new StSketchPoint(20,15));
        pts.push(new StSketchPoint(10,15));
        const rect = StSketchRect.buildRectByStartPoint(pts[0], 10, 5);

        const line = new StSketchLine(new StSketchPoint(13,10), new StSketchPoint(13, 15));
        const children = rect.divideByLine(line);
        this.assertEqual(children.length, 2);
        console.log(`Child-1: ${children[0]}`);
        console.log(`Child-2: ${children[1]}`);

        this.assertEqual(children[0].vertices.length,   4, "A rectangle has 4 vertices");
        this.assertEqual(children[0].edges.length,      4, "A rectangle has 4 edges");
        this.assertEqual(children[1].vertices.length,   4, "A rectangle has 4 vertices");
        this.assertEqual(children[1].edges.length,      4, "A rectangle has 4 edges");
        const info = `Child-1: ${children[0]}` + "\n"  + `Child-2: ${children[1]}`;
        return info;
    }
}

export const edgeTest = new StSketchEdgeTest();

export const polygonTest = new StSketchPolygonTest();