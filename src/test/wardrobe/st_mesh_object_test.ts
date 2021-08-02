import { StSketchVector, StSketchPolygon, StSketchRect } from "@/lib/geometry/st_geometric_2d";
import { StSketchVector3 } from "@/lib/geometry/st_geometric_3d";
import { StTexture, StWoodType, textureManager } from "@/lib/utility/st_texture";
import { StPillarMesh } from "@/lib/wardrobe/st_mesh_object";
import { StBoardMesh } from "@/lib/wardrobe/st_board_mesh";

export class StMeshObjectTest {
    createPillar_01(): void {
        const poly = StSketchPolygon.buildFromArray([
            [0, 0],
            [200, 0],
            [100, 100],
            [0, 0],
        ]);

        new StPillarMesh({
            position: new StSketchVector3(0, 0, 0),
            polygon: poly,
            depth: 500,
        }).createMesh();

        new StPillarMesh({
            position: new StSketchVector3(200, 0, 0),
            polygon: poly,
            depth: 500,
        }).createMesh();

        new StPillarMesh({
            position: new StSketchVector3(500, 0, 0),
            polygon: poly,
            depth: 500,
        }).createMesh();
    }

    /**
     * create boards with different positions
     */
    createBoard_01(): void {
        const rect: StSketchRect = StSketchRect.buildRectByStartPoint(new StSketchVector(0, 0), 600, 300);
        const oak_0: StTexture = textureManager.wood(StWoodType.OAK, 0);

        new StBoardMesh({
            position: new StSketchVector3(0, 200, 0),
            rect: rect,
            depth: 50,
            texture: oak_0,
        }).createMesh();

        const b2 = new StBoardMesh({
            position: new StSketchVector3(0, 400, 0),
            rect: rect,
            depth: 50,
            texture: oak_0,
        });
        b2.createMesh();
        b2.rotateY(Math.PI / 8);
    }

    /**
     * create boards and rotate
     * @deprecated:  DONOT rotate after creating the board!!
     */
    createBoard_02(): void {
        const rect: StSketchRect = StSketchRect.buildRectByStartPoint(new StSketchVector(0, 0), 450, 1200);
        const oak_0: StTexture = textureManager.wood(StWoodType.OAK, 0);

        const b1 = new StBoardMesh({
            position: new StSketchVector3(0, 0, 0),
            rect: rect,
            depth: 50,
            texture: oak_0,
        });
        b1.createMesh();
        b1.rotateY(Math.PI / -2);

        const b2 = new StBoardMesh({
            position: new StSketchVector3(600, 0, 0),
            rect: rect,
            depth: 50,
            texture: oak_0,
        });
        b2.createMesh();
        b2.rotateY(Math.PI / -2);
    }

    /**
     * create boards: LEFT, RIGHT
     */
    createBoard_03(): void {
        const [w, h, d] = [600, 1800, 450];
        const board_thickness = 20;

        // 1. the original board: LEFT & Bottom
        const left = StBoardMesh.buildSideBoard(d, h, board_thickness);
        const bottom = StBoardMesh.buildHorizonalBoard(w, d, board_thickness);
        console.log(`left & bottome board: ${left.type}, ${bottom.type}`);

        // 2.  translate in WORLD space: RIGHT
        const right = StBoardMesh.buildSideBoard(d, h, board_thickness);
        const mesh = right.__getMesh();
        console.log(`pos-1: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
        right.translate(new StSketchVector3(w - board_thickness, 0, 0));

        // 3.  translate in WORLD space: TOP
        const top = StBoardMesh.buildHorizonalBoard(w, d, board_thickness);
        //console.log(`top board: ${top}`);
        top.translate(new StSketchVector3(0, h - board_thickness, 0));
    }
}
