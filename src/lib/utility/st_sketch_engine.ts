/**
 * @file    st_sketch_engine.ts
 * @author  Guilin
 *
 * @description Used to initialize a room, called in vue onMount()
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-27] Created.
 *
 */

import { StBabylonRoom } from "../babylonjs/st_babylon_room";
import { St3DEngine } from "./st_3d_engine";
import { StCallbackUpdateCamera, StISketchRoom } from "./st_sketch_room_interface";

class StSketchEngine {
    private room!: StISketchRoom;

    getRoom(): StISketchRoom {
        return this.room;
    }

    initialize(
        engine: St3DEngine,
        canvas: HTMLCanvasElement,
        callbackOnUpdateCamera: StCallbackUpdateCamera,
        useGizmo?: boolean,
    ) {
        if (engine != St3DEngine.BABYLON_JS) {
            throw Error("ONLY BABYLON JS is supported!");
        }
        console.log(`Initialize 3D Engine: ${engine} `);
        this.room = new StBabylonRoom(canvas, callbackOnUpdateCamera, useGizmo);
    }
}

const sketchEngine = new StSketchEngine();

export { St3DEngine, sketchEngine };
