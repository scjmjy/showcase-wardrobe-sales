/**
 * @file    st_sketch_cube.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-28] Created.
 *
 */

import StSketchConstant from "../utility/st_sketch_constant";
import { StSketchEdge, StSketchLine, StSketchPoint, StSketchPolygon, StSketchRect } from "../geometry/st_geometric_2d";
import { StVector } from "../geometry/st_vector_2d";
import { StSketchVector3 } from "../geometry/st_geometric_3d";
import {
    StIAccesory,
    StICube,
    StIDivison,
    StILevel,
    StICubeOpt,
    StIDivisionOpt,
    StIDivideBoardOpt,
    StBoardMeshLocation,
} from "./st_model_interface";
import { StBoardMesh, StBoardType, StLineBoardMesh } from "./st_board_mesh";
import { StDoorType } from "../utility/st_sketch_type";
import { StColor } from "../utility/st_color";
import { StModel, StSketchAccesory } from "./st_model_object";
import { StWoodType, textureManager } from "../utility/st_texture";

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
     * [Guilin: 2021-8-16] use the input 'rect' to construct the default division.
     *
     * Reason: a division may be created by a divided sub rectangle, which changes if the divide board moves.
     * In this case, we hope the division changes, automatically.
     *
     * @param start_point position in the LEVEL/Cube Space ??
     * @param width
     * @param height
     */
    constructor(opt: StIDivisionOpt) {
        super(opt);
        if (opt.rect) {
            const pt = opt.rect.getStartPoint();
            if (!opt.position) {
                throw Error("position is required, if 'rect' is provided!");
            }
            const pt_pos = new StSketchPoint(opt.position.x, opt.position.y);
            if (!pt.overlaps(pt_pos)) {
                throw Error(`Rectangle start point ${pt} does not overlap with model position ${opt.position}`);
            }
            if (!(opt.width == opt.rect.a && opt.height == opt.rect.b)) {
                throw Error(
                    `Rectangle a/b does not match with model width/height. \n\t  - Rect: ${opt.rect}), \n\t - Model Width/Height: ${opt.width}/${opt.height}`,
                );
            }
            this.rect = opt.rect;
        } else {
            const size = this.getSize();
            const pos = this.getPosition();
            this.rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(pos.x, pos.y), size.x, size.y);
        }
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

    /**
     *
     * @param line any line in current division's SPACE
     * @returns
     */
    divideByLine(line: StSketchLine): StSketchDivision[] {
        const subs: StSketchDivision[] = [];
        const sub_rects = this.rect.divideByLine(line);
        if (sub_rects.length == 0) {
            console.log(`Division Rectangle ${this.rect} cannot be divided by line: ${line}`);
        } else if (sub_rects.length == 2) {
            const div1 = StSketchDivision.buildByRect(sub_rects[0], this.getPosition());
            const div2 = StSketchDivision.buildByRect(sub_rects[1]);
            subs.push(div1);
            subs.push(div2);

            // if divide success, delete all accessories
            for (const acce of this.parts) {
                acce.delete();
            }
        } else {
            console.error(`More than 2 sub divisions: ${subs.length}`);
            console.error(`Division ${this} is divided by line: ${line}`);
        }
        return subs;
    }

    /**
     * ONLY for testing
     */
    _getRect(): StSketchRect {
        return this.rect;
    }

    static buildByRect(poly: StSketchPolygon, pos?: StSketchVector3): StSketchDivision {
        const rect: StSketchRect = StSketchRect.buildByPolygon(poly);
        const pt0 = rect.getStartPoint().getVector();
        if (!pos) {
            pos = new StSketchVector3(pt0.x, pt0.y);
        }
        if (!(pt0.x == pos.x && pt0.y == pos.y)) {
            throw Error(`Position ${pos} does not overlap rectangle 1st point ${pt0}`);
        }
        const opt: StIDivisionOpt = {
            position: pos,
            width: rect.a,
            height: rect.b,
            rect: rect,
        };
        return new StSketchDivision(opt);
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

/**
 * A board that is parallels to Z axis
 */
export class StSketchBoardZ extends StModel {
    updateMesh(): void {
        // [Guilin: 2021-8-16] Currently, re-draw the mesh
        super.clearMesh();
        const board_mesh = StLineBoardMesh.buildByLine(this.line, this.getDepth(), StBoardMeshLocation.LEFT);
        this.meshList.push(board_mesh);
        console.log("draw mesh: boardZ");
    }

    private readonly line: StSketchLine;
    private readonly meshLoc: StBoardMeshLocation;

    constructor(opt: StIDivideBoardOpt) {
        super(opt);
        this.line = opt.line;
        this.meshLoc = opt.meshLoc || StBoardMeshLocation.LEFT;
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
     * each board/line is real wooden board.
     */
    private readonly divideBoard: Map<string, StSketchBoardZ> = new Map();

    /**
     * all divisions in this cube
     */
    private readonly divisions: Map<string, StSketchDivision> = new Map();

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

        // create the default division
        //
        // [Guilin: 2021-8-12] use 'this.rect' to construct the default division.
        // Reason: cube division(s) change(s) if the points of cube rectangle change.
        //
        const div_opt: StIDivisionOpt = obj;
        div_opt.position = this.getPosition();
        div_opt.rect = this.rect;
        const div = new StSketchDivision(div_opt);
        this.divisions.set(div.uuid, div);
    }

    updateMesh(): void {
        this._createCubeFrameBySize();
        // guilin: DO NOT update divisions?
        /* for(const div of this.divisions.values()) {
            div.updateMesh();
        } */
    }

    __getDivisions(): StSketchDivision[] {
        return Array.from(this.divisions.values());
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
     * point[0]: start for e0.pt[0], offset 20 cm;
     * point[1]: make a line(L) that starts from point[0] and vertical to e0. Get the point that L crosses with e1;
     *
     * @param e1
     * @param e2
     *
     * @returns the divide board (line)
     */
    addDivideBoard(e0: StSketchEdge, e1: StSketchEdge): StSketchLine {
        // 1. create a divide-line from the 2 points on the e0 & e1
        const p0 = e0.addPoint(200);
        const vec0 = e0.getVector().rotate(Math.PI / 2);
        const vec = StVector.makeVectorByLength(vec0, StSketchConstant.MAX_LENGTH);

        const p01 = p0.clone();
        p01.translate(vec);
        const line01 = new StSketchLine(p0, p01);

        const p1 = line01.intersectWith(e1);
        if (p1 == null) {
            throw Error(`Fail to find the intersecting point on the 2nd edge: ${e1}`);
        }
        const line = new StSketchLine(p0, p1);

        // 2. traverse all divisions, try to divide them with line
        // delete old division and add new divisions
        const cross_poly: StSketchPolygon[] = [];
        const delete_div_ids: string[] = [];
        const new_divs: StSketchDivision[] = [];

        for (const div of this.divisions.values()) {
            const subs = div.divideByLine(line);
            if (subs == null) {
                console.log(`## Board ${line} cannot divide division: ${div}`);
                continue;
            }
            this.assertTrue(subs.length == 2);
            delete_div_ids.push(div.uuid);
            new_divs.push(subs[0]);
            new_divs.push(subs[1]);
        }

        for (const div of new_divs) {
            this.divisions.set(div.uuid, div);
            console.log(`Add New Division: ${div} `);
        }

        for (const id of delete_div_ids) {
            const div = this.divisions.get(id);
            console.log(`Delete division: ${div}`);
            this.assertTrue(div != undefined);
            div?.delete();
            this.divisions.delete(id);
        }

        if (delete_div_ids.length <= 0) {
            throw Error(`line (${line}) fails to divide current cube: ${this}`);
        }

        // 3. create the divide board, based on the above divide-line
        const board = new StSketchBoardZ({
            depth: this.getDepth(),
            line: line,
        });
        board.updateMesh();
        this.divideBoard.set(board.uuid, board);
        console.log(`Add divide board: ${board}`);

        return line;
    }

    moveDivide(line: string, step?: number): StSketchLine {
        throw new Error("Method not implemented.");
    }

    deleteDivide(line: string): StSketchLine {
        throw new Error("Method not implemented.");
    }

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
