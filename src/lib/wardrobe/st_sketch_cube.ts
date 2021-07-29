import { StSketchPoint, StSketchRect } from "../geometry/st_geometric_2d";
import { StSketchVector3 } from "../geometry/st_geometric_3d";
import { StIAccesory, StICube, StIDivison, StILevel } from "./st_model_interface";
import { StBoardMesh } from "./st_board_mesh";
import { StDoorType } from "../utility/st_sketch_type";
import { StColor } from "../utility/st_color";
import { StModel, StSketchAccesory } from "./st_model_object";

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
    constructor(obj: StSketchDivision) {
        super(obj);
        const size = this.getSize();
        const pos = this.getPosition();
        this.rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(pos.x, pos.y), size.x, size.y);
    }

    setWidth(w: number): void {
        throw new Error("Method not implemented." + w);
    }
    setHeight(h: number): void {
        throw new Error("Method not implemented." + h);
    }
    setDepth(d: number): void {
        throw new Error("Method not implemented." + d);
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

export class StSketchLevel extends StModel implements StILevel {
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
        throw new Error("Method not implemented.");
    }
    setWidth(w: number): void {
        throw new Error("Method not implemented.");
    }
    setHeight(w: number): void {
        throw new Error("Method not implemented.");
    }
    setDepth(w: number): void {
        throw new Error("Method not implemented.");
    }
}

export class StSketchCube extends StModel implements StICube {
    doorType: StDoorType;
    gapTop: number;
    gapBottom: number;
    thickness: number;

    constructor(obj: any);
    constructor(obj: StSketchCube) {
        super(obj);
        this.doorType = obj.doorType || StDoorType.NONE;
        this.gapBottom = obj.gapBottom || 0;
        this.gapTop = obj.gapTop || 0;
        this.thickness = obj.thickness || 20;
        this._updateMesh();
    }

    private _updateMesh() {
        const [w, h, d] = this.getSize().toArray();
        const board_thickness = this.thickness;
        const left = StBoardMesh.buildSideBoard(w, h, board_thickness);
        const right = StBoardMesh.buildSideBoard(w, h, board_thickness);
        right.translate(new StSketchVector3(w - board_thickness, 0, 0));

        // todo
        // const top =
    }

    setWidth(w: number): void {
        throw new Error("Method not implemented.");
    }
    setHeight(w: number): void {
        throw new Error("Method not implemented.");
    }
    setDepth(w: number): void {
        throw new Error("Method not implemented.");
    }
    createLevel(offset_y: number): void {
        throw new Error("Method not implemented.");
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
