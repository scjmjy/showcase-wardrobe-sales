import { StSketchPoint, StSketchRect } from "../geometry/st_geometric_2d";
import { StSketchVector3 } from "../geometry/st_geometric_3d";
import { StIAccesory, StICube, StIDivison, StILevel } from "./st_model_interface";
import { StBoardMesh, StBoardType } from "./st_board_mesh";
import { StDoorType } from "../utility/st_sketch_type";
import { StColor } from "../utility/st_color";
import { StModel, StSketchAccesory } from "./st_model_object";
import { StTexture, StWoodType, textureManager } from "../utility/st_texture";

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

    constructor(obj: any);
    constructor(obj: StSketchCube) {
        super(obj);
        this.doorType = obj.doorType || StDoorType.NONE;
        this.gapBottom = obj.gapBottom || 100;
        this.gapTop = obj.gapTop || 0;
        this.thickness = obj.thickness || 20;
        this.updateMesh();
    }

    updateMesh(): void {
        for(const m of this.meshList) {
            m.deleteMesh();
        }
        this.meshList.slice(0, this.meshList.length);
        const back_texture = textureManager.wood(StWoodType.PINE, 0);
        const [w, h, d] = this.getSize().toArray();
        const TH = this.thickness;
        const left = StBoardMesh.buildSideBoard(d, h, TH);
        const right = StBoardMesh.buildSideBoard(d, h, TH);
        const top = StBoardMesh.buildHorizonalBoard(w - 2 * TH, d, TH);
        const bottom = StBoardMesh.buildHorizonalBoard(w - 2*TH, d, TH);
        const back = StBoardMesh.buildBoard(w, h, TH, StBoardType.FACE, back_texture);
        left.translate(new StSketchVector3(TH, 0, 0));
        right.translate(new StSketchVector3(w, 0, 0));
        bottom.translate(new StSketchVector3(TH, TH + this.gapBottom, 0));
        top.translate(new StSketchVector3   (TH, h - this.gapTop, 0));
        back.translate(new StSketchVector3(0, 0, d- TH));
        this.meshList.push(left, right, top, bottom, back);
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
