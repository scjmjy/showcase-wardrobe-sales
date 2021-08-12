/**
 * @file    st_sketch_container.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-30] Created.
 *
 */

import { StSketchRect } from "../geometry/st_geometric_2d";
import { StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StObject } from "../utility/st_object";
import { StContainerType } from "../utility/st_sketch_type";
import { StIModel } from "./st_model_interface";
import { StModel } from "./st_model_object";

/**
 * @deprecated [2021-8-6] currently, NOT used. Adding board in cube.
 */
export class StSketchContainer extends StObject implements StIRectArea {
    /**
     * The whole rectangle of this container
     */
    rect: StSketchRect;

    /**
     * the divided rectangles in this container
     */
    divRect: StSketchRect[] = [];

    /**
     * @deprecated
     */
    type: StContainerType;

    constructor(opt: {
        /*
        uuid: string;
        position?: StPoint3;
        rotate?: StSketchVector3; // reserved
        parent?: StIModel;
        childen?: StIModel[];
        width?: number;
        height?: number;
        depth?: number;
        */
        rect: StSketchRect;
        type?: StContainerType;
    }) {
        super();
        this.rect = opt.rect;
        this.type = opt.type || StContainerType.NODE;
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

    /**
     * Add a board at the input offset, by dividing the current level.
     *
     * [Algorithm]
     * - find the divide line by offset;
     * - divide the rectangle by the divide-line;
     *
     * @param offset
     */
    addBoard(type: StContainerType, offset: number): string {
        /* from old font-3d:
         */
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
        throw new Error("Method not implemented.");
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
