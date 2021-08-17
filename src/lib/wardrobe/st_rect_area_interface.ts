/**
 * @file    st_rect_area_interface.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-08-01] Created.
 * [Guilin 2021-08-06] Deprecated.
 *
 */

import { StSketchPoint, StSketchLine, StSketchRect } from "../geometry/st_geometric_2d";

/**
 * @deprecated
 */
export enum StContainerType {
    /**
     * The container does not have sub-containers.
     * A division is its only child.
     */
    NODE,

    VERTICAL,

    HORIZONAL,
}

/**
 * A rectangle area (v0.2), which is divided by both horizonal and vertical lines. 
 * 
 * An area may contains sub-areas, so that it can be divided into very small areas.
 *
 * @deprecated [2021-8-6] 
 *  (1) DO NOT use recursive divided-areas. It makes things complicated.
 * 
 *  (2) DO NOT add a horizonal/vertical line into ONE sub-area to seperate it.
 * REASON: a vertical board may go through the crossing horizonal board, and vice versa. 
 * In this case, ONE board divides MULTIPLE areas.
 * 
 */
export interface StIRectArea {
    rect: StSketchRect;

    selectPoint(edge: StSketchLine, offset: number): StSketchPoint;

    /**
     *
     * @param p0
     * @param p1
     *
     * return the ID of the line(board) model
     */
    addBoard(p0: StSketchPoint, p1: StSketchPoint): string;

    // /**
    //  * @param offset from the BOTTOM Edge of the divied rectangle
    //  */
    // addHorizonLine(offset: number): StIRectArea;

    // /**
    //  * @param offset from the LEFT edge of the divied rectangle
    //  */
    // addVerticalLine(offset: number): StIRectArea;

    setBoardOffset(id: string, offset: number): StIRectArea;

    /**
     * Delete the line and merge the neighbouring cells.
     * @param id UUID of the deleting board
     */
    deleteBoard(id: string): void;
}

/**
 * @description A rectangle area (v0.1), which can be divided into sub-areas.
 *
 * ==== requirement ====
 * When a divided line changes (moves or deleted), the nearly related area must be notified, so that its content is redrawed.
 *
 * ==== method 1 ====
 * Each rectangle area is divied into a list horizonal or vertical sub-rectangles. When a divide line changed, all sub areas in this container are searched for the RELATED rect.
 *
 * @deprecated by the free divided area.
 */
export interface StIRectArea_v0_1 /*extends StIModel*/ {
    rect: StSketchRect;

    type: StContainerType;

    /**
     * Add a board at the input offset, by dividing the current level.
     *
     * [Algorithm]
     * - find the divide line by offset;
     * - divide the rectangle by the divide-line;
     *
     * @param offset
     */
    addBoard(offset: number): string;

    setBoard(id: string, offset: string): number;

    deleteBoard(id: string): void;
}
