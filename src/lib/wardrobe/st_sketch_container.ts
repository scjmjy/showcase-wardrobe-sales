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
import { StContainerType } from "../utility/st_sketch_type";
import { StIModel, StIRectArea } from "./st_model_interface";
import { StModel } from "./st_model_object";

export class StSketchContainer extends StModel implements StIRectArea {
    rect: StSketchRect;
    type: StContainerType;

    constructor(opt: {
        uuid: string;
        position?: StPoint3;

        /**
         * Reserved
         */
        rotate?: StSketchVector3;

        parent?: StIModel;
        childen?: StIModel[];
        width?: number;
        height?: number;
        depth?: number;
        rect?: StSketchRect;
        type?: StContainerType;
    }) {
        super(opt);
        this.rect = opt.rect || StSketchRect.buildRect({ width: 0.1, height: 0.1 });
        this.type = opt.type || StContainerType.NODE;
    }

    addBoard(offset: number): string {
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
