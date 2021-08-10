/**
 * @file    st_sketch_cube.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-28] Created.
 *
 */

import { StSketchEdge, StSketchLine, StSketchPoint, StSketchPolygon, StSketchRect } from "../geometry/st_geometric_2d";
import { StVector } from "../geometry/st_vector_2d";
import { StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StIAccesory, StICube, StICubeOpt, StIDivison, StILevel, StIModel, StIModelOpt } from "./st_model_interface";
import { StBoardMesh, StBoardType } from "./st_board_mesh";
import { StDoorType } from "../utility/st_sketch_type";
import { StColor } from "../utility/st_color";
import { StModel, StSketchAccesory } from "./st_model_object";
import { StWoodType, textureManager } from "../utility/st_texture";

//import turf, { FeatureCollection, Point } from "@turf/turf";
// import turfhelpers from "@turf/helpers"

import StSketchConstant from "../utility/st_sketch_constant";
import { StAccesoryManager } from "../data/st_accesory_manager";

export class StSketchDivision extends StModel implements StIDivison {
    /**
     * The 4 points of the division rectangle,
     * - [ususally] in cube's SPACE;
     * - starting from LEFT-BOTTOM corner;
     * - ordered in counter-clock-wise;
     *
     *
     *  /\
     *  |                   <Cube SPACE>
     *  |
     *  |
     *  |    	+-(rect[3])-------------+ rect[2]
     *  |    	|						|
     *  |    	|						|
     *  |	    |						|
     *  |    	|						|
     *  |	    |						|
     *  | 	    +-(rect[0])-------------+ rect[1]
     *  |
     *  |
     *  |
     *  +------------------------------------------------------------->
     *
     *
     */
    private rect: StSketchRect;

    /**
     * An accesory is NOT managed as a child model! 
     * Can it be added as a child model??
     */
    readonly parts: StSketchAccesory[] = [];

    /**
     *
     * @param start_point position in the LEVEL/Cube Space ??
     * @param width
     * @param height
     */
    constructor(obj: StIModelOpt) {
        super(obj);
        const size = this.getSize();
        const pos = this.getPosition();
        this.rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(pos.x, pos.y), size.x, size.y);
    }

    updateMesh(): void {
        throw new Error("Method not implemented.");
    }

    calculateAvailable(acce_info: StIAccesory): StSketchRect[] {
        throw new Error("Method not implemented." + acce_info);
    }
    addAccesory(acce_info: StIAccesory): void {
        throw new Error("Method not implemented." + acce_info);
    }
    moveAccesory(acce_id: string, vec: StSketchVector3): void {
        throw new Error(`Method not implemented. id: ${acce_id} , ${vec}`);
    }
    deleteAccesory(acce_id: string): void {
        throw new Error(`Method not implemented. id: ${acce_id}`);
    }

    divideByEdge(e: StSketchEdge): StSketchDivision[] | null {
        const subs: StSketchDivision[] = [];

        


        // if divide success, delete all accessories
        for(const acce of this.parts) {
            acce.delete();
        }
        throw Error("TODO");
        return subs;
    }
}

/**
 * @deprecated by container
 */
export class StSketchLevel extends StModel implements StILevel {
    updateMesh(): void {
        throw new Error("Method not implemented.");
    }
    moveDivide(idx: number, step: number): number {
        throw new Error("Method not implemented.");
    }
    divideDivision(div_id: string): string {
        throw new Error("Method not implemented.");
    }
    deleteDivision(div_id: string): void {
        throw new Error("Method not implemented.");
    }
    getHeight(): number {
        return this.getSize().y;
    }
}

export enum StMeshLocation {
    MIDDLE,
    LEFT,
    RIGHT,
}

/**
 * A board that is parallels to Z axis
 */
export class StSketchBoardZ extends StModel {
    constructor(edge: StSketchEdge, depth: number, mesh_loc: StMeshLocation) {
        super({});
        throw new Error("Method not implemented.");
    }

    updateMesh(): void {
        throw new Error("Method not implemented.");
    }
}

export class StSketchCube extends StModel implements StICube {
    doorType: StDoorType;
    gapTop: number;
    gapBottom: number;
    thickness: number;

    /**
     * in LOCAL space. the 1st point is (0, 0).
     *
     * NOTE: divisions and edges are ALL in LOCAL space.
     */
    private readonly rect: StSketchRect;

    /**
     * each edge is real wooden board.
     */
    private readonly divideEdges: StSketchEdge[] = [];

    // private readonly divideRects: StSketchRect[] = [];  // [2021-8-9] seems useless?
    private readonly divisions: StSketchDivision[] = [];

    /**
     * KEY: Mesh ID of a board
     * Value: Edges
     */
    private readonly edgeMap: Map<string, StSketchEdge>;

    constructor(obj: StICubeOpt) {
        super(obj);
        this.doorType = obj.doorType || StDoorType.NONE;
        this.gapBottom = obj.gapBottom || 100;
        this.gapTop = obj.gapTop || 0;
        this.thickness = obj.thickness || 20;
        this.rect = StSketchRect.buildRect({ width: this.getWidth(), height: this.getHeight() });
        this.edgeMap = new Map<string, StSketchEdge>();
        this.updateMesh();
    }

    updateMesh(): void {
        this._createCubeFrameBySize();
    }

    private _createCubeFrameBySize(): void {
        // [Guilin: 2021-8-1] Currently, re-draw all the 5 faces. TODO-IN-FUTURE: redraw the changed faces and boards.
        for (const m of this.meshList) {
            m.deleteMesh();
        }
        this.meshList.slice(0, this.meshList.length);
        const back_texture = textureManager.wood(StWoodType.PINE, 0);
        const [w, h, d] = this.getSize().toArray();
        const TH = this.thickness;
        const left = StBoardMesh.buildSideBoard(d, h, TH);
        const right = StBoardMesh.buildSideBoard(d, h, TH);
        const top = StBoardMesh.buildHorizonalBoard(w - 2 * TH, d, TH);
        const bottom = StBoardMesh.buildHorizonalBoard(w - 2 * TH, d, TH);
        const back = StBoardMesh.buildBoard(w, h, TH, StBoardType.FACE, back_texture);
        left.translate(new StSketchVector3(TH, 0, 0));
        right.translate(new StSketchVector3(w, 0, 0));
        bottom.translate(new StSketchVector3(TH, TH + this.gapBottom, 0));
        top.translate(new StSketchVector3(TH, h - this.gapTop, 0));
        back.translate(new StSketchVector3(0, 0, d - TH));

        // 8-6: add mesh into map
        const edges = this.rect.edges;
        this.edgeMap.set(bottom.getMeshId(), edges[0]);
        this.edgeMap.set(right.getMeshId(), edges[1]);
        this.edgeMap.set(top.getMeshId(), edges[2]);
        this.edgeMap.set(left.getMeshId(), edges[3]);

        this.meshList.push(left, right, top, bottom, back);
    }

    getEdgeByMesh(mesh_id: string): StSketchEdge {
        const edge: StSketchEdge | undefined = this.edgeMap.get(mesh_id);
        if (!edge) {
            throw Error(`Fail to find Edge by mesh: ${mesh_id}`);
        }
        return edge;
    }

    /**
     * point[0]: start for e0.pt[0], offset 10cm;
     * point[1]: make a line(L) that starts from point[0] and vertical to e0. Get the point that L crosses with e1;
     *
     * @param e1
     * @param e2
     */
    addDivideBoard(e0: StSketchEdge, e1: StSketchEdge): StSketchEdge {
        // 1. create a line from the 2 points of input e1 and e0
        const p0 = e0.addPoint(100);
        const vec0 = e0.getVector().rotate(Math.PI / 2);
        const vec = StVector.makeVectorByLength(vec0, StSketchConstant.MAX_LENGTH);

        const p01 = p0.clone();
        p01.translate(vec);
        const line01 = new StSketchLine(p0, p01);

        const p1 = line01.intersectWith(e1);
        if (p1 == null) {
            throw Error(`Fail to find the intersecting point on the 2nd edge: ${e1}`);
        }
        const edge = new StSketchEdge(p0, p1);
        this.divideEdges.push(edge);

        // 2. search all divisions for the crossing polygons
        const cross_poly: StSketchPolygon[] = [];
        for (const div of this.divisions) {
            const subs = div.divideByEdge(edge);
            if (subs == null) {
                console.log(`edge ${edge} cannot divide division: ${div}`);
                continue;
            }
            // TODO
            
        }

        // 3. divides all crossing polygons

        throw new Error("Method not implemented.");
    }

    moveDivide(line: string, step?: number): StSketchLine {
        throw new Error("Method not implemented.");
    }

    deleteDivide(line: string): StSketchLine {
        throw new Error("Method not implemented.");
    }

    /* from old front-3d: addLevel
    *
        const height = this.getHeight() - this.gapTop - offset_y;
        const cnt = this.levels.length;
        if (cnt == 0) {
            // if cnt==0, add the 1st level, there is NO previous level.
            if (offset_y != this.gapBottom) {
                throw Error("Level 0 is NOT bottom: " + offset_y);
            }
        } else if (cnt > 0) {
            const range = this._getLevelRange();
            if (offset_y < range[0] || range[1] < offset_y) {
                console.error("Level Offset Y %d out of Range: %s", offset_y, range.toString());
                throw Error("Offset Y of New Level is NOT correct: " + offset_y);
            }
            const pre_level = this.levels[cnt - 1];
            const pre_level_height = pre_level.getHeight() - height;
            pre_level.setHeight(pre_level_height);
        }
        const level = new StCubeLevel(offset_y, height, this.width);
        this.levels.push(level);
        console.debug("Add Top Level. Offset Y: %d, Height: %d", offset_y, height);
    */

    changeTexture(txt_id: string): void {
        throw new Error("Method not implemented.");
    }
    changeColor(color: StColor): void {
        throw new Error("Method not implemented.");
    }
    calculateAvailable(acce: StIAccesory): StSketchRect[] {
        throw new Error("Method not implemented.");
    }
}
