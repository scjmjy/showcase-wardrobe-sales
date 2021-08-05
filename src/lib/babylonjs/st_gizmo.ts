//import * as BABYLON from "babylonjs";
//import "babylonjs-loaders";
/**
 * @file    st_gizmo.ts
 * @author  Guilin
 *
 * @description Based on the old JS file 'gizmo.js' form Shu Jian
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-29] Created.
 */

// enablePhysics the 3D scene :
export function setupGismo(scene: BABYLON.Scene, camera: BABYLON.Camera): BABYLON.GizmoManager {
    // export function setupGismo(scene, camera) {
    // Initialize GizmoManager
    const gizmoManager = new BABYLON.GizmoManager(scene);
    gizmoManager.keepDepthUtilityLayer.setRenderCamera(camera);
    gizmoManager.utilityLayer.setRenderCamera(camera);

    // Initialize all gizmos
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;

    // Modify gizmos based on keypress
    document.onkeydown = (e) => {
        if (
            !gizmoManager.gizmos ||
            !gizmoManager.gizmos.positionGizmo ||
            !gizmoManager.gizmos.rotationGizmo ||
            !gizmoManager.gizmos.scaleGizmo
        ) {
            throw Error("gizmo error");
        }
        if (e.key === "w" || e.key === "e" || e.key === "r") {
            // Switch gizmo type
            gizmoManager.positionGizmoEnabled = false;
            gizmoManager.rotationGizmoEnabled = false;
            gizmoManager.scaleGizmoEnabled = false;
            if (e.key === "w") {
                gizmoManager.positionGizmoEnabled = true;
            }
            if (e.key === "e") {
                gizmoManager.rotationGizmoEnabled = true;
            }
            if (e.key === "r") {
                gizmoManager.scaleGizmoEnabled = true;
            }
        } else if (e.key === "q") {
            // hide the gizmo
            gizmoManager.attachToMesh(null);
        } else if (e.key === "a") {
            // Toggle local/global gizmo rotation positioning
            gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh =
                !gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh;
            gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh =
                !gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh;
        } else if (e.key === "s") {
            // Toggle distance snapping
            if (gizmoManager.gizmos.scaleGizmo.snapDistance === 0) {
                gizmoManager.gizmos.scaleGizmo.snapDistance = 0.3;
                gizmoManager.gizmos.rotationGizmo.snapDistance = 0.3;
                gizmoManager.gizmos.positionGizmo.snapDistance = 0.3;
            } else {
                gizmoManager.gizmos.scaleGizmo.snapDistance = 0;
                gizmoManager.gizmos.rotationGizmo.snapDistance = 0;
                gizmoManager.gizmos.positionGizmo.snapDistance = 0;
            }
        } else if (e.key === "t") {
            // Toggle gizmo size
            if (gizmoManager.gizmos.scaleGizmo.scaleRatio === 1) {
                gizmoManager.gizmos.scaleGizmo.scaleRatio = 1.5;
                gizmoManager.gizmos.rotationGizmo.scaleRatio = 1.5;
                gizmoManager.gizmos.positionGizmo.scaleRatio = 1.5;
            } else {
                gizmoManager.gizmos.scaleGizmo.scaleRatio = 1;
                gizmoManager.gizmos.rotationGizmo.scaleRatio = 1;
                gizmoManager.gizmos.positionGizmo.scaleRatio = 1;
            }
        }
    };

    // Start by only enabling position control
    const evt = new KeyboardEvent("w");
    document.dispatchEvent(evt);

    return gizmoManager;
}
