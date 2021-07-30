/**
 * @file    st_sketch_container.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-30] Created.
 *
 */

import { StSketchRect } from "../geometry/st_geometric_2d";
import { StSketchVector3 } from "../geometry/st_geometric_3d";
import { StContainerType } from "../utility/st_sketch_type";
import { StIModel, StIModelOpt, StIRectArea, StIRectAreaOpt, StIUuidObject } from "./st_model_interface";
import { StModel } from "./st_model_object";

export class StSketchContainer extends StModel implements StIRectArea {
    rect: StSketchRect;
    type: StContainerType;

    constructor(obj: StIUuidObject );
    constructor(obj: StIRectAreaOpt) {
    /*constructor(obj: {
        rect: StSketchRect;
        type?: StContainerType;
        parent: StIModel;
        width?: number;
        height?: number;
        depth?: number;
        position?: StSketchVector3;
    }) { */
        super(obj);
        this.rect = obj.rect ||  obj.rect;
        this.type = obj.type || StContainerType.NODE;
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
