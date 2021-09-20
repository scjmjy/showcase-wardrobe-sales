import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
// import * as Materials from "babylonjs-materials"
import { EventEmitter2 } from "eventemitter2";
import { ObjectType } from "@/lib/biz.data";

const EXTERNAL_EVENT_OBJECT_ONSELECTED = "graphics.external.object.onselected";
const EXTERNAL_EVENT_OBJECT_ONUNSELECTED = "graphics.external.object.onunselected";

export const GraphicsEvent = {
    EXTERNAL_EVENT_OBJECT_ONSELECTED,
    EXTERNAL_EVENT_OBJECT_ONUNSELECTED,
};

export class Graphics {
    public scene!: BABYLON.Scene;
    public eventDispatcher: EventEmitter2;
    public highlightLayer!: BABYLON.HighlightLayer;

    private readonly _canvas: HTMLCanvasElement;
    private readonly _engine: BABYLON.Engine;
    private _camera!: BABYLON.ArcRotateCamera;
    private _light!: BABYLON.DirectionalLight;
    private _shadowGenerator!: BABYLON.ShadowGenerator;

    private _pprenderer!: BABYLON.DefaultRenderingPipeline;
    private _ssaorenderer!: BABYLON.SSAORenderingPipeline;
    private _isSsaoAttached = false;

    private _isPointerDown = false;
    private _currentMesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private _currentHighlightMesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private _hoverColor: BABYLON.Color3 = BABYLON.Color3.Green();
    private _selectedColor: BABYLON.Color3 = BABYLON.Color3.Yellow();
    private _gui!: GUI.AdvancedDynamicTexture;

    private _debugMode = false;
    private _debugPanel!: GUI.StackPanel;
    private _engineInst!: BABYLON.EngineInstrumentation;
    private _sceneInst!: BABYLON.SceneInstrumentation;
    private _gizmoManager: BABYLON.Nullable<BABYLON.GizmoManager> = null;

    constructor(canvasElement: HTMLCanvasElement) {
        this._canvas = canvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true, { preserveDrawingBuffer: true, stencil: true });

        this.eventDispatcher = new EventEmitter2({
            wildcard: true, // set this to `true` to use wildcards
            // delimiter: '.',        // the delimiter used to segment namespaces, defaults to `.`
            newListener: true, // set this to `true` to avoid conflicts on the same page
            maxListeners: 20, // the maximum amount of listeners that can be assigned to an event
            verboseMemoryLeak: false, // show event name in memory leak message when more than maximum amount of listeners is assigned, default false
        });
    }

    init(size: number): void {
        // setup scene
        this.scene = new BABYLON.Scene(this._engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString("#f2f4f5ff");
        this.scene.ambientColor = BABYLON.Color3.FromHexString("#ffffff");
        this.scene.lightsEnabled = true;
        this.scene.shadowsEnabled = true;

        this._camera = new BABYLON.ArcRotateCamera(
            "MainCamera",
            Math.PI / 2,
            Math.PI / 2,
            size,
            new BABYLON.Vector3(0, 1.1, 0),
            this.scene,
        );
        this._camera.maxZ = size * 3.75;
        this._camera.panningSensibility = 100;
        this._camera.wheelDeltaPercentage = 0.0025;
        this._camera.pinchDeltaPercentage = 0.0001;
        this._camera.lowerAlphaLimit = 0;
        this._camera.upperAlphaLimit = Math.PI;
        this._camera.lowerBetaLimit = Math.PI / 2;
        this._camera.upperBetaLimit = Math.PI / 2;
        // Control the zoom limit.
        this._camera.upperRadiusLimit = 10;
        this._camera.lowerRadiusLimit = 2;
        this.lockCamera(false);

        this._light = new BABYLON.DirectionalLight("MainLight", new BABYLON.Vector3(0.6, -1.0, -2.5), this.scene);
        this._light.position = new BABYLON.Vector3(0, 0, size);
        this._light.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
        this._light.specular = new BABYLON.Color3(0.0, 0.0, 0.0);
        this._light.intensity = 2.3;

        // Setup shadow
        this._shadowGenerator = new BABYLON.ShadowGenerator(2048, this._light);
        this._shadowGenerator.useBlurExponentialShadowMap = false;
        this._shadowGenerator.bias = 0.001;
        this._shadowGenerator.normalBias = 0.015;
        // this._shadowGenerator.useContactHardeningShadow = true;
        // this._shadowGenerator.contactHardeningLightSizeUVRatio = 0.05;
        this._shadowGenerator.setDarkness(0.3);
        this._shadowGenerator.useKernelBlur = false;

        // setup environment.
        const environment = this.scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false,
            groundSize: size * 2.1,
            skyboxSize: size * 2.1,
            // groundTexture: "/3d/res/backgroundGround.png",
            // skyboxTexture: "/3d/res/backgroundSkybox.dds",
            environmentTexture: "/3d/res/studio-old.env",
            groundColor: new BABYLON.Color3(0.9, 0.9, 1),
            enableGroundShadow: false,
            groundShadowLevel: 0.72,
            toneMappingEnabled: false,
            // sizeAuto: true,
            // backgroundYRotation: 0,
            // cameraContrast: 2.35,
            // cameraExposure: 0.6,
            skyboxColor: new BABYLON.Color3(0.8, 0.8, 1),
        });
        if (environment) environment.setMainColor(BABYLON.Color3.White());

        const backgroundPlane = this.scene.getMeshByName("BackgroundPlane");
        if (backgroundPlane) backgroundPlane.isPickable = false;

        const skyBoxMesh = this.scene.getMeshByName("BackgroundSkybox");
        if (skyBoxMesh !== null) {
            skyBoxMesh.isPickable = false;
            this._light.excludedMeshes.push(skyBoxMesh);
            this._shadowGenerator.removeShadowCaster(skyBoxMesh);
        }

        // this.setupRender();

        // Setup interaction of mouse event.
        this.setupInteraction();

        // Setup keyboard.
        this.setupKeyboard();

        // Setup gizmo.
        this.setupGizmo();

        // Setup debug mode.
        this.setupDebugMode();
        this.enableDebugMode(this._debugMode);
    }

    dispose(): void {
        this.scene.dispose();
        this._engine.dispose();
    }

    clearScene(): void {
        while (this.scene.meshes.length > 2) {
            this.scene.meshes.forEach((mesh: BABYLON.AbstractMesh) => {
                // Note: if creating skybox, need to keep it here.
                if (!mesh.name.startsWith("Background")) {
                    mesh.dispose(true, true);
                }
            });
        }
    }

    setupRender(): void {
        // Create SSAO and configure all properties (for the example)
        const ssaoRatio = {
            ssaoRatio: 0.4, // Ratio of the SSAO post-process, in a lower resolution
            combineRatio: 1.0, // Ratio of the combine post-process (combines the SSAO and the scene)
        };

        this._pprenderer = new BABYLON.DefaultRenderingPipeline("default pipeline", true, this.scene, [this._camera]);
        this._pprenderer.samples = 8;
        this._pprenderer.imageProcessing.toneMappingEnabled = true;
        this._pprenderer.fxaaEnabled = false;

        this._ssaorenderer = new BABYLON.SSAORenderingPipeline("ssao", this.scene, ssaoRatio);
        this._ssaorenderer.fallOff = 0.000001;
        this._ssaorenderer.area = 0.0075;
        this._ssaorenderer.radius = 0.0006;
        this._ssaorenderer.totalStrength = 1.0;
        this._ssaorenderer.base = 0.8;

        this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", this._camera);
        this.scene.postProcessRenderPipelineManager.enableEffectInPipeline(
            "ssao",
            this._ssaorenderer.SSAOCombineRenderEffect,
            this._camera,
        );

        this._isSsaoAttached = true;
    }

    render(): void {
        this._engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this._engine.resize();
        });
    }

    public highlightMesh(mesh: BABYLON.Nullable<BABYLON.AbstractMesh>, color: BABYLON.Color3): void {
        if (mesh !== null) {
            // TODO: only handle child, not all descendant(not including grandchild).
            const childMeshes = mesh.getChildMeshes();
            childMeshes.forEach((childMesh) => {
                this.highlightLayer.addMesh(childMesh as BABYLON.Mesh, color);
            });

            const rootMesh = mesh as BABYLON.Mesh;
            if (rootMesh) this.highlightLayer.addMesh(rootMesh, color);

            // TODO: Ugly way to fix a bug. Not follow the design.
            if (mesh.name.startsWith(ObjectType.CUBE)) {
                this.scene.meshes.forEach((mesh) => {
                    const isDoor = mesh.name.startsWith(ObjectType.DOOR);
                    if (isDoor) {
                        mesh.getChildMeshes().forEach((childMesh) => {
                            if (childMesh.getClassName() === "Mesh") {
                                this.highlightLayer.addExcludedMesh(childMesh as BABYLON.Mesh);
                                childMesh.renderingGroupId = 1;
                                this.scene.setRenderingAutoClearDepthStencil(1, false, false, false);
                            }
                        });
                    }
                });
            } else if (mesh.name.startsWith(ObjectType.DOOR)) {
                mesh.getChildMeshes().forEach((childMesh) => {
                    if (childMesh.getClassName() === "Mesh") {
                        this.highlightLayer.removeExcludedMesh(childMesh as BABYLON.Mesh);
                        childMesh.renderingGroupId = 0;
                    }
                });
            }
        }
    }

    public removeHighlightMesh(mesh: BABYLON.Nullable<BABYLON.AbstractMesh>): void {
        if (mesh !== null) {
            // TODO: only handle child, not all descendant(not including grandchild).
            const childMeshes = mesh.getChildMeshes();
            childMeshes.forEach((childMesh) => {
                this.highlightLayer.removeMesh(childMesh as BABYLON.Mesh);
            });

            const rootMesh = mesh as BABYLON.Mesh;
            if (rootMesh) this.highlightLayer.removeMesh(rootMesh);
        }
    }

    // TODO: Handle the transparent objects later.
    private setupInteraction(): void {
        this.highlightLayer = new BABYLON.HighlightLayer("HighlightLayer", this.scene, {
            blurVerticalSize: 1,
            blurHorizontalSize: 1,
        });

        this.scene.onPointerObservable.add((pointerInfo: BABYLON.PointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    // if (pointerInfo.pickInfo) console.log("POINTER DOWN: " + pointerInfo.pickInfo.pickedMesh);
                    this._isPointerDown = true;
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    this._isPointerDown = false;

                    if (
                        pointerInfo &&
                        pointerInfo.pickInfo &&
                        pointerInfo.pickInfo.pickedMesh &&
                        !pointerInfo.pickInfo.pickedMesh.name.startsWith("Background")
                    ) {
                        // const pickedMesh = pointerInfo.pickInfo.pickedMesh;
                        const pickedMesh = this.getRootMesh(pointerInfo.pickInfo.pickedMesh);
                        if (pickedMesh !== null) {
                            // if pick previous selected object, emit the selected event too.
                            this.eventDispatcher.emit(GraphicsEvent.EXTERNAL_EVENT_OBJECT_ONSELECTED, {
                                name: pickedMesh.name,
                            });
                        }

                        if (pickedMesh !== this._currentMesh) {
                            if (this._currentMesh !== null) {
                                this.removeHighlightMesh(this._currentMesh);
                            }

                            this._currentMesh = pickedMesh;
                            this.highlightMesh(this._currentMesh, this._selectedColor);
                        }
                    } else {
                        if (this._currentMesh) {
                            this.eventDispatcher.emit(GraphicsEvent.EXTERNAL_EVENT_OBJECT_ONUNSELECTED, {
                                name: this._currentMesh.name,
                            });

                            this.removeHighlightMesh(this._currentMesh);
                            this._currentMesh = null;
                        }
                    }

                    this._currentHighlightMesh = null;
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:
                    // if (this._isPointerDown) return;
                    // {
                    //     const ptInfo = this.scene.pick(
                    //         this.scene.pointerX,
                    //         this.scene.pointerY,
                    //         (mesh) => {
                    //             // return !mesh.name.startsWith("Background") && mesh.isPickable;
                    //             return mesh.isPickable;
                    //         },
                    //         false,
                    //         this.scene.cameraToUseForPointers,
                    //     );

                    //     if (ptInfo && ptInfo.pickedMesh && !ptInfo.pickedMesh.name.startsWith("Background")) {
                    //         //const pickedMesh = ptInfo.pickedMesh;
                    //         const pickedMesh = this.getRootMesh(ptInfo.pickedMesh);

                    //         if (this._currentHighlightMesh != null && this._currentHighlightMesh != pickedMesh) {
                    //             this.removeHighlightMesh(this._currentHighlightMesh);
                    //             this._currentHighlightMesh = null;
                    //         }

                    //         if (this._currentHighlightMesh == null && this._currentMesh != pickedMesh) {
                    //             this._currentHighlightMesh = pickedMesh;
                    //             this.highlightMesh(this._currentHighlightMesh, this._hoverColor);
                    //         }
                    //     } else {
                    //         if (this._currentHighlightMesh != null && this._currentHighlightMesh != this._currentMesh) {
                    //             this.removeHighlightMesh(this._currentHighlightMesh);
                    //         }

                    //         this._currentHighlightMesh = null;
                    //     }
                    // }
                    break;
                case BABYLON.PointerEventTypes.POINTERWHEEL:
                    break;
                case BABYLON.PointerEventTypes.POINTERPICK:
                    break;
                case BABYLON.PointerEventTypes.POINTERTAP:
                    break;
                case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                    break;
            }
        });
    }

    private setupKeyboard(): void {
        this.scene.onKeyboardObservable.add((kbInfo: BABYLON.KeyboardInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    // console.log("KEY DOWN: ", kbInfo.event.key)
                    switch (kbInfo.event.key) {
                        case "1":
                            this._light.setEnabled(!this._light.isEnabled());
                            break;
                        case "2":
                            this.scene.shadowsEnabled = !this.scene.shadowsEnabled;
                            break;
                        case "3":
                            if (!this._isSsaoAttached) {
                                this._isSsaoAttached = true;
                                this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(
                                    "ssao",
                                    this._camera,
                                );
                                this.scene.postProcessRenderPipelineManager.enableEffectInPipeline(
                                    "ssao",
                                    this._ssaorenderer.SSAOCombineRenderEffect,
                                    this._camera,
                                );
                            } else {
                                this._isSsaoAttached = false;
                                this.scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline(
                                    "ssao",
                                    this._camera,
                                );
                            }
                            break;
                        case "4":
                            this._pprenderer.fxaaEnabled = !this._pprenderer.fxaaEnabled;
                            break;
                        case "8":
                            this._camera.attachControl(this._canvas);
                            break;
                        case "9":
                            this._camera.detachControl(this._canvas);
                            break;
                        case "0":
                            // Switch the debug mode.
                            this.enableDebugMode(!this._debugMode);
                            break;
                    }
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    break;
            }
        });
    }

    private setupGizmo(): void {
        // Initialize GizmoManager
        this._gizmoManager = new BABYLON.GizmoManager(this.scene);

        // Initialize all gizmos
        this._gizmoManager.positionGizmoEnabled = false;
        this._gizmoManager.rotationGizmoEnabled = false;
        this._gizmoManager.scaleGizmoEnabled = false;

        // Modify gizmos based on keypress
        document.onkeydown = (e) => {
            if (!this._gizmoManager) return;

            if (e.key === "w" || e.key === "e" || e.key === "r") {
                // Switch gizmo type
                this._gizmoManager.positionGizmoEnabled = false;
                this._gizmoManager.rotationGizmoEnabled = false;
                this._gizmoManager.scaleGizmoEnabled = false;
                if (e.key === "w") {
                    this._gizmoManager.positionGizmoEnabled = true;
                }
                if (e.key === "e") {
                    this._gizmoManager.rotationGizmoEnabled = true;
                }
                if (e.key === "r") {
                    this._gizmoManager.scaleGizmoEnabled = true;
                }
            } else if (e.key === "q") {
                // Hide the gizmo
                this._gizmoManager.attachToMesh(null);
            } else if (e.key === "a") {
                // Toggle local/global gizmo rotation positioning
                if (this._gizmoManager.gizmos.positionGizmo)
                    this._gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh =
                        !this._gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh;

                if (this._gizmoManager.gizmos.rotationGizmo)
                    this._gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh =
                        !this._gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh;
            } else if (e.key === "s") {
                // Toggle distance snapping
                if (this._gizmoManager.gizmos.scaleGizmo && this._gizmoManager.gizmos.scaleGizmo.snapDistance === 0) {
                    if (this._gizmoManager.gizmos.scaleGizmo) this._gizmoManager.gizmos.scaleGizmo.snapDistance = 0.3;
                    if (this._gizmoManager.gizmos.rotationGizmo)
                        this._gizmoManager.gizmos.rotationGizmo.snapDistance = 0.3;
                    if (this._gizmoManager.gizmos.positionGizmo)
                        this._gizmoManager.gizmos.positionGizmo.snapDistance = 0.3;
                } else {
                    if (this._gizmoManager.gizmos.scaleGizmo) this._gizmoManager.gizmos.scaleGizmo.snapDistance = 0;
                    if (this._gizmoManager.gizmos.rotationGizmo)
                        this._gizmoManager.gizmos.rotationGizmo.snapDistance = 0;
                    if (this._gizmoManager.gizmos.positionGizmo)
                        this._gizmoManager.gizmos.positionGizmo.snapDistance = 0;
                }
            } else if (e.key === "t") {
                // Toggle gizmo size
                if (this._gizmoManager.gizmos.scaleGizmo && this._gizmoManager.gizmos.scaleGizmo.scaleRatio === 1) {
                    if (this._gizmoManager.gizmos.scaleGizmo) this._gizmoManager.gizmos.scaleGizmo.scaleRatio = 1.5;
                    if (this._gizmoManager.gizmos.rotationGizmo)
                        this._gizmoManager.gizmos.rotationGizmo.scaleRatio = 1.5;
                    if (this._gizmoManager.gizmos.positionGizmo)
                        this._gizmoManager.gizmos.positionGizmo.scaleRatio = 1.5;
                } else {
                    if (this._gizmoManager.gizmos.scaleGizmo) this._gizmoManager.gizmos.scaleGizmo.scaleRatio = 1;
                    if (this._gizmoManager.gizmos.rotationGizmo) this._gizmoManager.gizmos.rotationGizmo.scaleRatio = 1;
                    if (this._gizmoManager.gizmos.positionGizmo) this._gizmoManager.gizmos.positionGizmo.scaleRatio = 1;
                }
            }
        };
    }

    private enableDebugMode(enable: boolean): void {
        this._debugMode = enable;
        this._debugPanel.isVisible = enable;
        this.enableInstrumentation(enable);

        if (this._gizmoManager) {
            this._gizmoManager.positionGizmoEnabled = enable;
            this._gizmoManager.rotationGizmoEnabled = false;
            this._gizmoManager.scaleGizmoEnabled = false;
        }

        if (enable) {
            this._camera.lowerAlphaLimit = -Math.PI / 2;
            this._camera.upperAlphaLimit = (3 * Math.PI) / 2;
            this._camera.lowerBetaLimit = 0;
            this._camera.upperBetaLimit = Math.PI;
            this._camera.upperRadiusLimit = 1000;
            this._camera.lowerRadiusLimit = 0.05;
        } else {
            this._camera.lowerAlphaLimit = 0;
            this._camera.upperAlphaLimit = Math.PI;
            this._camera.lowerBetaLimit = Math.PI / 2;
            this._camera.upperBetaLimit = Math.PI / 2;
            this._camera.upperRadiusLimit = 10;
            this._camera.lowerRadiusLimit = 2;
        }
    }

    private setupDebugMode(): void {
        this.enableInstrumentation(true);

        // Debug Panel
        const debugGUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("Debug GUI");
        // if (debugGUI.layer) debugGUI.layer.layerMask = 0x10000000;
        this._debugPanel = new GUI.StackPanel("Debug Panel");
        this._debugPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._debugPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._debugPanel.isVertical = true;
        debugGUI.addControl(this._debugPanel);

        const fps = this.createDebugItem(this._debugPanel, "FPS");

        const gpuFrameTime = this.createDebugItem(this._debugPanel, "gpuFrameTime");
        const shaderCompilationTime = this.createDebugItem(this._debugPanel, "shaderCompilationTime");
        const shaderCount = this.createDebugItem(this._debugPanel, "shaderCount");

        const frameTime = this.createDebugItem(this._debugPanel, "frameTime");
        const renderTime = this.createDebugItem(this._debugPanel, "renderTime");
        const drawCallCount = this.createDebugItem(this._debugPanel, "drawCallCount");
        const interFrameTime = this.createDebugItem(this._debugPanel, "interFrameTime");
        const activeMeshesEvaluationTime = this.createDebugItem(this._debugPanel, "activeMeshesEvaluationTime");
        const renderTargetsRenderTime = this.createDebugItem(this._debugPanel, "renderTargetsRenderTime");
        const particlesRenderTime = this.createDebugItem(this._debugPanel, "particlesRenderTime");
        const spritesRenderTime = this.createDebugItem(this._debugPanel, "spritesRenderTime");
        const physicsTime = this.createDebugItem(this._debugPanel, "physicsTime");
        const cameraRenderTime = this.createDebugItem(this._debugPanel, "cameraRenderTime");

        this.scene.registerAfterRender(() => {
            if (this._debugMode) {
                fps.text = "FPS: " + this._engine.getFps().toFixed();

                gpuFrameTime.text =
                    "gpu frame time: " + (this._engineInst.gpuFrameTimeCounter.current * 0.000001).toFixed(2) + "ms";
                shaderCompilationTime.text =
                    "compiler shaders time: " + this._engineInst.shaderCompilationTimeCounter.total.toFixed(2) + "ms";
                shaderCount.text = "compiler shaders Count: " + this._engineInst.shaderCompilationTimeCounter.count;

                frameTime.text = "frame time: " + this._sceneInst.frameTimeCounter.current.toFixed(2) + "ms";
                renderTime.text = "render time: " + this._sceneInst.renderTimeCounter.current.toFixed(2) + "ms";
                drawCallCount.text = "draw call count: " + this._sceneInst.drawCallsCounter.current;
                interFrameTime.text =
                    "inter frame time: " + this._sceneInst.interFrameTimeCounter.current.toFixed(2) + "ms";
                activeMeshesEvaluationTime.text =
                    "active meshes evaluation time: " +
                    this._sceneInst.activeMeshesEvaluationTimeCounter.current.toFixed(2) +
                    "ms";
                renderTargetsRenderTime.text =
                    "render targets render time: " +
                    this._sceneInst.renderTargetsRenderTimeCounter.current.toFixed(2) +
                    "ms";
                particlesRenderTime.text =
                    "particles render time: " + this._sceneInst.particlesRenderTimeCounter.current.toFixed(2) + "ms";
                spritesRenderTime.text =
                    "sprites render time: " + this._sceneInst.spritesRenderTimeCounter.current.toFixed(2) + "ms";
                physicsTime.text = "physics time: " + this._sceneInst.physicsTimeCounter.current.toFixed(2) + "ms";
                cameraRenderTime.text =
                    "camera render time: " + this._sceneInst.cameraRenderTimeCounter.current.toFixed(2) + "ms";
            }
        });
    }

    private enableInstrumentation(isEnabled: boolean): void {
        // Engine instrumentation
        if (this._engineInst == null) this._engineInst = new BABYLON.EngineInstrumentation(this._engine);
        this._engineInst.captureGPUFrameTime = isEnabled;
        this._engineInst.captureShaderCompilationTime = isEnabled;

        // Scene instrumentation
        if (this._sceneInst == null) this._sceneInst = new BABYLON.SceneInstrumentation(this.scene);
        this._sceneInst.captureFrameTime = isEnabled;
        this._sceneInst.captureRenderTime = isEnabled;
        this._sceneInst.captureInterFrameTime = isEnabled;
        this._sceneInst.captureActiveMeshesEvaluationTime = isEnabled;
        this._sceneInst.captureParticlesRenderTime = isEnabled;
        this._sceneInst.captureSpritesRenderTime = isEnabled;
        this._sceneInst.capturePhysicsTime = isEnabled;
        this._sceneInst.captureCameraRenderTime = isEnabled;
    }

    private createDebugItem(_debugPanel: GUI.StackPanel, itemName: string): GUI.TextBlock {
        const text = new GUI.TextBlock();
        text.text = itemName;
        text.color = "blue";
        text.fontSize = 16;
        text.height = "30px";
        text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        _debugPanel.addControl(text);
        return text;
    }

    public addShadow(mesh: BABYLON.AbstractMesh): void {
        this._shadowGenerator.addShadowCaster(mesh);
    }

    public receiveShadow(bReceive: boolean, mesh: BABYLON.AbstractMesh, includeDecandents: boolean) {
        mesh.receiveShadows = bReceive;
        if (includeDecandents) {
            mesh.getChildMeshes().forEach((childMesh) => {
                childMesh.receiveShadows = true;
            });
        }
    }

    public setCameraPosition(x: number, y: number, z: number): void {
        this._camera.position = new BABYLON.Vector3(x, y, z);
    }

    public setCameraTarget(x: number, y: number, z: number): void {
        this._camera.target = new BABYLON.Vector3(x, y, z);
    }

    public lockCamera(lock: boolean): void {
        if (lock) this._camera.detachControl(this._canvas);
        else this._camera.attachControl(this._canvas);
    }

    public getMeshByName(name: string): BABYLON.Nullable<BABYLON.AbstractMesh> {
        return this.scene.getMeshByName(name);
    }

    public getMeshesByTags(tags: string): BABYLON.Mesh[] {
        return this.scene.getMeshesByTags(tags);
    }

    public getRootMesh(mesh: BABYLON.AbstractMesh): BABYLON.Nullable<BABYLON.AbstractMesh> {
        let rootMesh: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
        if (mesh !== null) {
            rootMesh = mesh;
            let parentMesh = mesh.parent;
            while (parentMesh !== null) {
                rootMesh = parentMesh as BABYLON.AbstractMesh;
                parentMesh = parentMesh.parent;
            }
        }

        return rootMesh;
    }

    public async importMesh(
        url: string,
        name: string,
        position: BABYLON.Vector3 = BABYLON.Vector3.Zero(),
        rotation: BABYLON.Vector3 = BABYLON.Vector3.Zero(),
        scaling: BABYLON.Vector3 = BABYLON.Vector3.One(),
        isPickable = true,
    ) {
        const loadedList = await BABYLON.SceneLoader.ImportMeshAsync("", url, "", this.scene);
        if (loadedList.meshes) {
            const rootMesh = loadedList.meshes[0];
            rootMesh.name = name;
            rootMesh.position = position;
            rootMesh.rotation = rotation;
            rootMesh.scaling = scaling;
            this.addShadow(rootMesh);

            loadedList.meshes.forEach((mesh) => {
                mesh.isPickable = isPickable;
                mesh.receiveShadows = true;
            });
            return rootMesh;
        } else {
            console.log("Import mesh failed: " + url);
            return null;
        }
    }

    // TODO: add the clone or instance later?
    public addDummyMesh(
        name: string,
        width: number,
        height: number,
        depth: number,
        position: BABYLON.Vector3,
        rotation: BABYLON.Vector3 = BABYLON.Vector3.Zero(),
        scale: BABYLON.Vector3 = BABYLON.Vector3.One(),
        castShadow = false,
    ): void {
        const dummyMesh = BABYLON.MeshBuilder.CreateBox(
            name,
            { width: width, height: height, depth: depth },
            this.scene,
        );
        dummyMesh.position = new BABYLON.Vector3(position.x, position.y + height * 0.5, position.z);
        dummyMesh.rotation = rotation;
        dummyMesh.scaling = scale;

        const dummyMeshMat = new BABYLON.StandardMaterial("dummyMeshMaterial", this.scene);
        dummyMeshMat.emissiveColor = new BABYLON.Color3(0.8, 0, 0.8);
        dummyMesh.material = dummyMeshMat;

        if (castShadow) this.addShadow(dummyMesh);

        dummyMesh.showBoundingBox = true;
    }

    public removeCurrentHighlight(): void {
        if (this._currentMesh !== null) {
            this.removeHighlightMesh(this._currentMesh);
            this._currentHighlightMesh = null;
            this._currentMesh = null;
        }
    }

    public disableLightEffect(mesh: BABYLON.AbstractMesh): void {
        if (this._light) {
            this._light.excludedMeshes.push(mesh);
        }
    }

    public createScreenshotAsync(size: any): Promise<string> {
        return new Promise((resolve, reject) => {
            BABYLON.Tools.CreateScreenshot(this._engine, this._camera, size, (data) => {
                if (typeof data !== "undefined") {
                    resolve(data);
                } else {
                    reject(new Error("Screenshot data is undefined"));
                }
            });
        });
    }

    public createScreenshotUsingRenderTargetAsync(size: any, samples = 1, antialiasing = false): Promise<string> {
        return new Promise((resolve, reject) => {
            BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                this._engine,
                this._camera,
                size,
                (data) => {
                    if (typeof data !== "undefined") {
                        resolve(data);
                    } else {
                        reject(new Error("Screenshot data is undefined"));
                    }
                },
                "image/png",
                samples,
                antialiasing,
            );
        });
    }

    public lightingOn(direction: BABYLON.Vector3, position: BABYLON.Vector3, intensity: number): void {
        this._light.direction = direction || this._light.direction;
        this._light.position = position || this._light.position;
        this._light.intensity = intensity == undefined ? 1 : intensity;
    }

    public setBackgroundColor(color: BABYLON.Color4): void {
        if (this.scene) {
            this.scene.clearColor = color;
        } else {
            console.log("Caution: SetBackgroundColor: called before 3D scene is created!!!");
        }
    }

    public get currentMesh(): BABYLON.Nullable<BABYLON.AbstractMesh> {
        return this._currentMesh;
    }

    public get hoverColor(): BABYLON.Color3 {
        return this._hoverColor;
    }

    public set hoverColor(color: BABYLON.Color3) {
        this._hoverColor = color;
    }

    get selectedColor(): BABYLON.Color3 {
        return this._selectedColor;
    }

    set selectedColor(color: BABYLON.Color3) {
        this._selectedColor = color;
    }
}
