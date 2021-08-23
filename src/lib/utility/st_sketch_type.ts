/**
 * @file    st_sketch_types.ts
 * @author 	Guilin
 *
 * @description Types used in sketch lib
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-11] Created.
 *
 */

export type StCallbackOnSelectMesh = (cube_id: string, select_id: string) => void;

export enum StDoorType {
    NONE,
    SINGLE,
    DOUBLE,
    SLIDE,
}

export enum StAccesoryType {
    NONE,
    PULLOUT,
    DOUBLE_FIXED, // 两头固定的内配件。e.g. 晾衣杆。
    SIDE_FIXED,
}

export enum StPulloutType {
    NONE,
    DRAWER, //抽屉
    DRAWER_WITH_GLASS_FRONT, // 抽屉带玻璃前板
    PULLOUT_TROUSER_HANGER, // 拉出式裤挂
    SHOW_BOX,
    SHOW_SHELF, // 鞋架
    MESH_BASKET, // 密网篮
    CLOTH_RAIL, // 挂衣杆
}

export enum StCubePart {
    NONE,
    // UNIT,
    // CUBE,
    FACE,
    LEVEL, // horizonal
    DIVISION, // vertical
    DOOR,
    PULLOUT,
}

/**
 * Seems uesless. 
 * Replaced by StVector.LEFT/DOWN/RIGHT/UP
 */
export enum StDirection {
    NONE, 
    LEFT, DOWN, RIGHT, UP
}
