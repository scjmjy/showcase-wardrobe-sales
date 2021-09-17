/**
 * @file    st_model_interface.ts
 * @author 	Guilin
 *
 * @description Biz Model interfaces
 *
 * A Model is a logic object to store data for a business object which can be
 * rendered to a 3D mesh object. Some model may have no visible 3D mesh,
 * e.g. division. Its ‘position’ is the 3D Location in its parent SPACE.
 *
 * IModel and its sub interface APIs change the data and view.
 * i.e. WHAT YOU SEE IS WHAT YOU GET
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-28] Created.
 *
 */

import { StSketchEdge, StSketchLine, StSketchRect } from "../geometry/st_geometric_2d";
import { StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StDoorType, StPulloutType } from "../utility/st_sketch_type";
import { StColor } from "../utility/st_color";

export {
    StIModel,
    StIAccesory,
    StIMovable,
    StIPullout,
    StIDivison,
    StILevel,
    StICube,
    StIModelOpt,
    StIDivisionOpt,
    StICubeOpt,
    StIDivideBoardOpt,
};

/**
 * Interface: Biz Model Object, e.g. a wardrobe, a cube, a division.
 */
interface StIModel {
    readonly uuid: string;
    setParent(parent: StIModel): void;
    getParent(): StIModel | undefined;

    /**
     * position in its parent model?
     */
    getPosition(): StPoint3;

    /**
     * move postion of this mode.
     * the polygon points in model space do NOT change!
     * @param v
     */
    translate(v: StSketchVector3): void;

    /**
     * rotate model in its parent SPACE
     * @param angle
     */
    rotateY(angle: number): void;

    addChild(child: StIModel): void;
    deleteChild(child_uuid: string): StIModel | null;
    getChild(uuid: string): StIModel | null;
    getChilden(uuid: string): StIModel[];

    /**
     * Changing size (w/h/d) causes the 3D mesh in BABYLON updated.
     * @param w
     */
    setWidth(w: number): void;
    setHeight(h: number): void;
    setDepth(d: number): void;
    getSize(): StSketchVector3;

    updateMesh(): void;

    /**
     * release all 3D resources.
     */
    delete(): void;
}

interface StIAccesory extends StIModel {
    /**
     * Get the occupied retangle in its parent in the X-o-Y plane.
     */
    getOccupyRect(): StSketchRect;

    /**
     * Check if current accesory overlaps with another in the same parent model(division)
     * @param acce
     */
    overlapWith(acce: StIAccesory): boolean;
}

interface StIMovable extends StIAccesory {
    /**
     * get the accesory, which this movable sits on.
     */
    getBase(): StIAccesory;
}

interface StIPullout extends StIAccesory {
    /**
     * @param out_value (0 - 1)
     */
    pullout(out_value: number): void;

    readonly pulloutType: StPulloutType;
}

/**
 *
 * @description  A division is the container for accesories.
 *
 * A division has a rectangle on the XOY plane.
 *
 * Usually, the location of the this rectangle is in the cube's SPACE.
 *
 * Accessories are added into a division, NOT a cube!
 *
 * NOTE: 不要通过 index 作为Mesh ID的一部分来标记一个Division。
 * [REASON]：只有重绘一个Level中的所有Division，才能正确标记这个Division的MeshID。
 * As a result, redrawing the WHOLE LEVEL is required if a divison is deleted.
 * In addition, redrawing the WHOLE CUBE is required, if a level is deleted.
 * This method is a time-cost!!
 *
 */
interface StIDivison extends StIModel {
    calculateAvailable(acce_info: StIAccesory): StSketchRect[];

    addAccesory(acce: StIAccesory): void;

    moveAccesory(acce_id: string, vec: StSketchVector3): void;

    deleteAccesory(acce_id: string): void;
}

/**
 * a level a made of 1-n division.
 *
 * @deprecated  by StIRectArea
 */
interface StILevel extends StIModel {
    /**
     * If a divide is moved, its left divison width changes, while the right one moves its position
     * @param idx  start from 1 to 'divisions.length()-1'
     * @param step
     */
    moveDivide(idx: number, step: number): number;

    divideDivision(div_id: string): string;

    deleteDivision(div_id: string): void;

    getHeight(): number;

    // setHeight(h: number): void;
}

interface StICube extends StIModel {
    // /**
    //  * @deprecated  by StIRectArea
    //  */
    // createLevel(offset_y: number): void;

    // /**
    //  * @deprecated  by StIRectArea
    //  */
    // setLevelOffset(level_id: string, offset_y: number): void;

    // /**
    //  * @deprecated  by StIRectArea
    //  */
    // deleteLevel(level_id: string): void;

    // /**
    //  * @deprecated  by StIRectArea
    //  */
    // deleteDivision(div_id: string): void;

    changeTexture(txt_id: string): void;

    changeColor(color: StColor): void;

    calculateAvailable(acce: StIAccesory): StSketchRect[];
}

/**
 * Constructor Option (Parameter)
 */
interface StIModelOpt {
    /**
     * the 3D Position in its parent model.
     *
     * e.g. if current model is
     * - a cube,    its position is in the drobe-unit SPACE.
     * - a divison, its position is in the drobe-cube SPACE.
     *
     */
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
}

/**
 * If rect is defined,
 * - `position` must be defined. And rect.pts[0] must be overlaps with position.
 * - `width/height` must be defined. And same to rect.a/b;
 *
 */
interface StIDivisionOpt extends StIModelOpt {
    rect?: StSketchRect;
}

/**
 * board mesh location, according to the board line
 */
export enum StBoardMeshLocation {
    MIDDLE, // board mesh is in the middle of the line
    LEFT, // board mesh is left of the line
    RIGHT,
}

interface StIDivideBoardOpt extends StIModelOpt {
    edge: StSketchEdge;
    meshLoc?: StBoardMeshLocation;
}

/**
 * Constructor Parameter
 */
interface StICubeOpt extends StIModelOpt {
    doorType?: StDoorType;
    gapTop?: number;
    gapBottom?: number;
    thickness?: number;
}
