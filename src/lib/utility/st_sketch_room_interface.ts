/**
 * @file    st_sketch_room_interface.ts
 * @author  Guilin
 *
 * @description  Room interface
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-26] Created.
 *
 */

export type StCallbackUpdateCamera = (pos: BABYLON.Vector3, target: BABYLON.Vector3, rotate: BABYLON.Vector3) => void;

export interface StISketchRoom {
    readonly canvas: HTMLCanvasElement;
    readonly useGizmo: boolean;
    readonly onUpdateCamera: StCallbackUpdateCamera;
    readonly scene: any;

    setCameraPos(x: number, y: number, z: number): void;
}
