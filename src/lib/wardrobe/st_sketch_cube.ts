/**
 * @file    st_sketch_cube.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-28] Created.
 *
 */

import { StSketchPoint, StSketchRect } from "../geometry/st_geometric_2d";
import { StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StIAccesory, StICube, StICubeOpt, StIDivison, StILevel, StIModel, StIModelOpt } from "./st_model_interface";
import { StBoardMesh, StBoardType } from "./st_board_mesh";
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

    readonly parts: StSketchAccesory[] = [];

    /**
     *
     * @param start_point position in the LEVEL/Cube Space ??
     * @param width
     * @param height
     */
    //constructor(obj: start_point: StSketchPoint, width:number, height:number) {
    // constructor(obj: any);
    /* constructor(obj:{
        parent: StIModel;
        width?: number;
        height?: number;
        depth?: number;
        position?: StSketchVector3;
    }) { */
    constructor(obj: StIModelOpt) {
        super(obj);
        const size = this.getSize();
        const pos = this.getPosition();
        this.rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(pos.x, pos.y), size.x, size.y);
    }

    /*
    setWidth(w: number): void {
        throw new Error("Method not implemented." + w);
    }
    setHeight(h: number): void {
        throw new Error("Method not implemented." + h);
    }
    setDepth(d: number): void {
        throw new Error("Method not implemented." + d);
    }
    */
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
    /*
    setWidth(w: number): void {
        throw new Error("Method not implemented.");
    }
    setHeight(w: number): void {
        throw new Error("Method not implemented.");
    }
    setDepth(w: number): void {
        throw new Error("Method not implemented.");
    }
    */
}

export class StSketchCube extends StModel implements StICube {
    doorType: StDoorType;
    gapTop: number;
    gapBottom: number;
    thickness: number;

    readonly levels: StSketchLevel[] = [];

    constructor(obj: StICubeOpt) {
        /*
    constructor( model_opt: StIModelOpt, obj: {
        position?: StPoint3;
        rotate?: StSketchVector3;
        parent?: StIModel;
        childen?: StIModel[];
        width?: number;
        height?: number;
        depth?: number;
        doorType?: StDoorType;
        gapTop?: number;
        gapBottom?: number;
        thickness?: number;
    } ) {  */
        super(obj);
        this.doorType = obj.doorType || StDoorType.NONE;
        this.gapBottom = obj.gapBottom || 100;
        this.gapTop = obj.gapTop || 0;
        this.thickness = obj.thickness || 20;
        this.updateMesh();
    }

    updateMesh(): void {
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
        this.meshList.push(left, right, top, bottom, back);
    }

    createLevel(offset_y: number): void {
        /* from old font-3d:
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
    }

    setLevelOffset(level_id: string, offset_y: number): void {
        throw new Error("Method not implemented.");
    }
    deleteLevel(level_id: string): void {
        throw new Error("Method not implemented.");
    }
    deleteDivision(div_id: string): void {
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
