import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

var gizmoManager = null;

// enablePhysics the 3D scene :
export const setupGismo = (scene, camera) => {
    // export function setupGismo(scene, camera) {
    // Initialize GizmoManager
    if (!gizmoManager) gizmoManager = new BABYLON.GizmoManager(scene);
    gizmoManager.keepDepthUtilityLayer.setRenderCamera(camera);
    gizmoManager.utilityLayer.setRenderCamera(camera);

    // Initialize all gizmos
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;

    // Modify gizmos based on keypress
    document.onkeydown = (e) => {
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
    document.onkeydown({ key: "w" });

    return gizmoManager;
};
