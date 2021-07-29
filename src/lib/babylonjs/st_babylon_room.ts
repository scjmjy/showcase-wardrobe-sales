/**
 * @file    st_babylon_room.ts
 * @author  Guilin
 *
 * @description initialize 3D engine: babylon.js
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-27] Created. Based on st_sketch_room
 *
 *
 */
import { StISketchRoom } from "../utility/st_sketch_room_interface";
import StBabylonUtil from "./st_babylon_util";
export type StCallbackUpdateCamera = (pos: BABYLON.Vector3, target: BABYLON.Vector3, rotate: BABYLON.Vector3) => void;

//const StGizmo = require("./gizmo.js");
//const StGizmo = await import("./gizmo.js");
//import * as StGizmo from "./gizmo";
//import StGizmo = require("./gizmo.js");
//import setupGismo from "./gizmo.js";
//import setupGismo from "./gizmo";
import * as StGizmo from "./st_gizmo";

/**
 * initialize babaylon JS engine
 */
export class StBabylonRoom implements StISketchRoom {
    readonly canvas: HTMLCanvasElement;
    readonly useGizmo: boolean;
    readonly onUpdateCamera: StCallbackUpdateCamera;

    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.Camera;
    light: BABYLON.HemisphericLight;

    // wardrobe: StWardrobe | null = null;

    private updateCamera = false;
    private updateCameraPos: BABYLON.Vector3;

    constructor(canvas: HTMLCanvasElement, onUpdateCamera: StCallbackUpdateCamera, useGizmo?: boolean) {
        this.canvas = canvas;
        this.useGizmo = useGizmo === true;

        console.log("1. Create BABYLON Engine ... ");
        // Generate the BABYLON 3D engine:
        // - turn on 'stenci' fro high-light.
        //   See: https://doc.babylonjs.com/divingDeeper/mesh/highlightLayer
        const engine = new BABYLON.Engine(canvas, true, { stencil: true });

        console.log("2. Create BABYLON Scene，Camera and Ligth ...");
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI / 2,
            3,
            new BABYLON.Vector3(0, 0, 0),
            scene,
        );
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 8;
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

        console.log("3. Register a render loop to repeatedly render the scene");
        //const that = this;
        const engine_loop = this._onEngineLoop;
        engine.runRenderLoop(function () {
            scene.render();
            engine_loop();
        });

        console.log("3. Watch for browser/canvas resize events");
        window.addEventListener("resize", function () {
            console.debug("ST: Recv RESIZE event ...");
            engine.resize();
        });

        StBabylonUtil.showWorldAxis(3, scene);
        this.engine = engine;
        this.scene = scene;
        this.camera = camera;
        this.light = light;
        this.updateCamera = false;
        this.updateCameraPos = camera.position;
        this.onUpdateCamera = onUpdateCamera;

        if (useGizmo === true) {
            console.log("use gizmo!");
            StGizmo.setupGismo(scene, camera);
        }
    }
    private _onEngineLoop() {
        if (this.updateCamera == true) {
            const cam = this.camera;
            if (cam instanceof BABYLON.ArcRotateCamera) {
                cam.setPosition(this.updateCameraPos);
                cam.setTarget(new BABYLON.Vector3(0, 0, 0));
                this.updateCamera = false;
                const pos = cam.position;
                const target = cam.target;
                const rotate = new BABYLON.Vector3(cam.alpha, cam.beta, cam.radius);
                this.onUpdateCamera(pos, target, rotate);
                console.log("camera rotation (alpht/beta/radius): %d,%d,%d", cam.alpha, cam.beta, cam.radius);
                console.log("-- camera position:  %d,%d,%d", pos.x, pos.y, pos.z);
                console.log("-- camera target:    %d,%d,%d", target.x, target.y, target.z);
            }
        }
    }

    setCameraPos(x: number, y: number, z: number): void {
        this.updateCameraPos = new BABYLON.Vector3(x, y, z);
        this.updateCamera = true;
        console.log("## to set camrate pos: %d,%d,%d", x, y, z);
        console.log("    ---- camera postion: %o", this.updateCameraPos);
    }
}
