/**
 * @file    st_sketch_container.ts
 * @author 	Guilin
 * 
 * @description a container can be divided by a horizonal or vertical board. 
 *              A division / cube is a contrainer.
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-30] Created.
 * [Guilin 2021-08-06] Deprecated.
 *
 */

import { StSketchLine, StSketchPoint, StSketchRect } from "../geometry/st_geometric_2d";
import { StIModel } from "./st_model_interface";
import { StModel } from "./st_model_object";
import { StContainerType, StIRectArea } from "./st_rect_area_interface";

/**
 * @deprecated [2021-8-6] currently, container is NOT used. A board is added into a cube.
 */
class StSketchContainer extends StModel implements StIRectArea {
    /**
     * The whole rectangle of this container
     */
    rect: StSketchRect;

    /**
     * the divided rectangles in this container
     */
    divRect: StSketchRect[] = [];

    type: StContainerType;

    constructor(opt: {
        rect: StSketchRect;
        type?: StContainerType;
    }) {
        super({});
        this.rect = opt.rect;
        this.type = opt.type || StContainerType.NODE;
    }

    selectPoint(edge: StSketchLine, offset: number): StSketchPoint {
        throw new Error("Method not implemented.");
    }
    addBoard(p0: StSketchPoint, p1: StSketchPoint): string {
        throw new Error("Method not implemented.");
    }
    setBoardOffset(id: string, offset: number): StIRectArea {
        throw new Error("Method not implemented.");
    }


    addChild(ch: StIModel): void {
        let child: StIModel | undefined;

        switch (this.type) {
            case StContainerType.NODE:
                if (ch instanceof StSketchContainer) {
                    child = ch;
                }
                break;
            case StContainerType.HORIZONAL | StContainerType.VERTICAL:
                if (ch instanceof StSketchContainer) {
                    child = ch;
                }
                break;
            default:
                break;
        }
        if (!child) {
            throw Error(`container-type(${this.type}) does not match added child ${ch.constructor.name}`);
        }
        super.addChild(ch);
    }



    setBoard(id: string, offset: string): number {
        throw new Error("Method not implemented.");
    }

    deleteBoard(id: string): void {
        throw new Error("Method not implemented.");
    }

    updateMesh(): void {
        throw new Error("Method not implemented.");
    }
}
