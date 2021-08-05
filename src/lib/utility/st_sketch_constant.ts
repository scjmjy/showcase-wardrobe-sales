/**
 * @file    st_sketch_constant.ts
 * @author  Guilin
 *
 * @description Constants used in Sketch's babylon-lib
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-14] Created.
 *
 */

export default class StSketchConstant {
    static readonly VERSION = "v0.6.0-snapshot";
    static readonly ST_PREFIX = "_st_";
    static readonly SCALE_FROM_MM = 1000;
    static readonly DEFAULT_THICKNESS_MM = 20;
    static readonly GAP_TOP = 50;
    static readonly GAP_BOTTOM = 100;
    static readonly MIN_LEVEL_MM = 200;
    static readonly MIN_DIVISION_MM = 100;

    // normal vectors for X, Y, Z
    static readonly NORMAL_X: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
    static readonly NORMAL_Y: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
    static readonly NORMAL_Z: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
}
