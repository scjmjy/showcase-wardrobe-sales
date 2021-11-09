import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import { Graphics } from "@/lib/graphics";
import { BizData, ObjectType } from "@/lib/biz.data";
import { Cube, PartType } from "@/lib/scheme";

import Babylon from "@/components/Babylon/Babylon.vue";
type RefBabylon = InstanceType<typeof Babylon>;

export class PopupGUI {
    public rulerDisplayed = false;
    private _popupUI!: GUI.AdvancedDynamicTexture;
    private _switchCubePanel!: GUI.Rectangle[];
    private _deletePanel: BABYLON.Nullable<GUI.Rectangle> = null;
    private _deleteButton!: GUI.Button;

    private _sliderPanel: BABYLON.Nullable<GUI.StackPanel> = null;
    private _grid_silder: BABYLON.Nullable<GUI.Grid> = null;

    private _loadingPanel: BABYLON.Nullable<GUI.Rectangle> = null;
    private _loadingInfo: BABYLON.Nullable<GUI.TextBlock> = null;
    private _loadingSlider: BABYLON.Nullable<GUI.Slider> = null;
    private _loadingHintInfo: BABYLON.Nullable<GUI.TextBlock> = null;

    private referenceRulerUpTop: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private referenceRulerUpMiddle: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private referenceRulerUpEnd: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private _referenceRulerTextUp!: GUI.TextBlock;
    private _referenceRulerTextDown!: GUI.TextBlock;

    private referenceRulerDownTop: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private referenceRulerDownMiddle: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private referenceRulerDownEnd: BABYLON.Nullable<BABYLON.AbstractMesh> = null;

    private rulerHeightTop: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerWidthTop: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerDepthTop: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerHeightMiddle: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerWidthMiddle: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerDepthMiddle: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerHeightDown: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerWidthDown: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private rulerDepthDown: BABYLON.Nullable<BABYLON.AbstractMesh> = null;
    private _rulerTextHeight!: GUI.TextBlock;
    private _rulerTextDepth!: GUI.TextBlock;
    private _rulerTextWidth!: GUI.TextBlock;

    constructor() {
        this._switchCubePanel = new Array<GUI.Rectangle>();
    }

    public loading(graphics: Graphics) {
        // GUI
        if (this._popupUI == null) {
            this._popupUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("popupGUI", true, graphics.scene);
        }
        // console.log('=================> setup ui')

        // Level one panel : undo redo all clear
        if (this._loadingPanel == null) {
            this._loadingPanel = new GUI.Rectangle();
            this._loadingPanel.width = "528px";
            this._loadingPanel.height = "181px";
            this._loadingPanel.color = "#EAE7EAFF";
            this._loadingPanel.background = "white";
            this._loadingPanel.cornerRadius = 4;
            this._loadingPanel.thickness = 1;
            //  this._loadingPanel.isVertical = false;
            this._popupUI.addControl(this._loadingPanel);

            this._loadingInfo = new GUI.TextBlock();
            this._loadingInfo.text = "衣柜加载中…";
            this._loadingInfo.width = "144px";
            this._loadingInfo.height = "32px";
            this._loadingInfo.fontStyle = "bold";
            this._loadingInfo.fontSize = 24;
            this._loadingInfo.color = "black";
            //  this._loadingInfo.isVertical = false;
            this._loadingInfo.top = 34;
            this._loadingInfo.left = 44;
            this._loadingInfo.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            this._loadingInfo.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this._loadingPanel.addControl(this._loadingInfo);

            this._loadingSlider = new GUI.Slider();
            this._loadingSlider.left = 44;
            this._loadingSlider.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this._loadingSlider.minimum = 0;
            this._loadingSlider.maximum = 1;
            this._loadingSlider.value = 0.55;
            this._loadingSlider.isThumbClamped = true;
            this._loadingSlider.isVertical = false;
            this._loadingSlider.displayThumb = false;
            this._loadingSlider.height = "24px";
            this._loadingSlider.width = "455px";
            this._loadingSlider.background = "#E5EEF5FF";
            this._loadingSlider.color = "#0058A3FF";
            this._loadingPanel.addControl(this._loadingSlider);

            this._loadingHintInfo = new GUI.TextBlock();
            this._loadingHintInfo.text = "小贴士：进行测量时，确保距离天花板还有9厘米的高度";
            this._loadingHintInfo.width = "402px";
            this._loadingHintInfo.height = "24px";
            this._loadingHintInfo.fontSize = 16;
            this._loadingHintInfo.color = "gray";
            //  this._loadingHintInfo.isVertical = false;
            this._loadingHintInfo.top = -24;
            this._loadingHintInfo.left = 44;
            this._loadingHintInfo.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            this._loadingHintInfo.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this._loadingPanel.addControl(this._loadingHintInfo);
        }
        if (this._loadingSlider) {
            // this._loadingSlider.value = this.loadedTemplateMeshCount / this.needToLoadCount
            // if (this._loadingSlider.value === 1) {
            setTimeout(() => {
                if (this._loadingPanel) this._loadingPanel.dispose();
                this._loadingPanel = null;
            }, 3500);
            // }
        }
    }

    display(babylonRef: RefBabylon, mesh: BABYLON.Nullable<BABYLON.AbstractMesh>, min = -1, max = -1): void {
        //  hide GUI when click empty area
        if (mesh == null) {
            if (this._deletePanel) {
                this._deletePanel.dispose();
                this._deletePanel = null;
            }
            if (this._sliderPanel) {
                this._sliderPanel.dispose();
                this._sliderPanel = null;
            }
            if (this._switchCubePanel) {
                for (let i = 0; i < this._switchCubePanel.length; i++) {
                    this._switchCubePanel[i].dispose();
                }
            }
            if (this.referenceRulerDownEnd) this.referenceRulerDownEnd.dispose();
            if (this.referenceRulerDownMiddle) this.referenceRulerDownMiddle.dispose();
            if (this.referenceRulerDownTop) this.referenceRulerDownTop.dispose();
            if (this.referenceRulerUpEnd) this.referenceRulerUpEnd.dispose();
            if (this.referenceRulerUpMiddle) this.referenceRulerUpMiddle.dispose();
            if (this.referenceRulerUpTop) this.referenceRulerUpTop.dispose();
            if (this._referenceRulerTextDown) this._referenceRulerTextDown.dispose();
            if (this._referenceRulerTextUp) this._referenceRulerTextUp.dispose();
            return;
        }

        if (this._popupUI == null) {
            this._popupUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("popupGUI", true, babylonRef.graphics.scene);
        }

        // clear previous silder panel to avoid adjust previous mesh
        if (this._sliderPanel != null) {
            this._sliderPanel.dispose();
            this._sliderPanel = null;
        }

        this.createSilderPanel(babylonRef, mesh, min, max);
        this.createDeletePanel(babylonRef, mesh);
        this.showSwitchCubePanel(babylonRef, mesh);

        const info = mesh.name.split("_");
        const itemId = info[1];
        const item = babylonRef.bizdata.findItemById(itemId);
        if (item == null) return;

        const upCenter = new BABYLON.Vector3(0, 0, 0);
        upCenter.x = mesh.position.x;
        upCenter.y = mesh.position.y + (max - mesh.position.y) / 2 + item.size.y;
        upCenter.z = mesh.position.z;
        const downCenter = new BABYLON.Vector3(0, 0, 0);
        downCenter.x = mesh.position.x;
        downCenter.y = mesh.position.y - (mesh.position.y - min) / 2;
        downCenter.z = mesh.position.z;

        if ((max - mesh.position.y) / 2 > 0 && item.partType != PartType.VERTICAL_SCALE)
            this.drawRuler(
                babylonRef.graphics,
                max - mesh.position.y,
                upCenter,
                new BABYLON.Vector3(0, 1, 0),
                "referenceRulerUp ",
                max - mesh.position.y,
            );
        if (downCenter.y - min > 0 && item.partType != PartType.VERTICAL_SCALE)
            this.drawRuler(
                babylonRef.graphics,
                mesh.position.y - min,
                downCenter,
                new BABYLON.Vector3(0, 1, 0),
                "referenceRulerDown ",
                mesh.position.y - min,
            );
    }

    private createSilderPanel(
        babylonRef: RefBabylon,
        mesh: BABYLON.Nullable<BABYLON.AbstractMesh>,
        min = -1,
        max = -1,
    ) {
        if (mesh == null) return;
        const info = mesh.name.split("_");
        const objectType = info[0];

        if (this._sliderPanel == null && ObjectType.ITEM == objectType && min != 0 && max != 0) {
            this._grid_silder = new GUI.Grid();
            this._popupUI.addControl(this._grid_silder);

            // TO DO : silder position code
            this._grid_silder.addColumnDefinition(0.95);
            this._grid_silder.addColumnDefinition(0.05);
            this._grid_silder.addRowDefinition(0.95);
            this._grid_silder.addRowDefinition(0.05);

            this._sliderPanel = new GUI.StackPanel();
            this._sliderPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this._sliderPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this._sliderPanel.width = "320px";
            this._grid_silder.addControl(this._sliderPanel, 0, 0);

            const slider = new GUI.ImageBasedSlider();
            slider.minimum = min;
            slider.maximum = max;
            slider.isVertical = true;
            slider.isThumbClamped = true;
            slider.displayThumb = true;
            slider.width = "22px";
            slider.height = "360px";
            slider.backgroundImage = new GUI.Image(
                "back",
                "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/img/backgroundImage-vertical.png",
            );
            slider.thumbImage = new GUI.Image(
                "thumb",
                "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/img/thumb.png",
            );

            slider.onValueChangedObservable.add((value: number) => {
                if (mesh) {
                    const info = mesh.name.split("_");
                    const itemId = info[1];
                    const item = babylonRef.bizdata.findItemById(itemId);
                    if (item == null) return;
                    const upCenter = new BABYLON.Vector3(0, 0, 0);
                    upCenter.x = mesh.position.x;
                    upCenter.y = mesh.position.y + (max - mesh.position.y) / 2 + item.size.y;
                    upCenter.z = mesh.position.z;
                    const downCenter = new BABYLON.Vector3(0, 0, 0);
                    downCenter.x = mesh.position.x;
                    downCenter.y = mesh.position.y - (mesh.position.y - min) / 2;
                    downCenter.z = mesh.position.z;
                    if ((max - mesh.position.y) / 2 > 0)
                        this.drawRuler(
                            babylonRef.graphics,
                            max - mesh.position.y,
                            upCenter,
                            new BABYLON.Vector3(0, 1, 0),
                            "referenceRulerUp ",
                            max - mesh.position.y,
                        );
                    if (downCenter.y - min > 0)
                        this.drawRuler(
                            babylonRef.graphics,
                            mesh.position.y - min,
                            downCenter,
                            new BABYLON.Vector3(0, 1, 0),
                            "referenceRulerDown ",
                            mesh.position.y - min,
                        );
                    mesh.position.y = value;
                    if (item !== undefined) {
                        babylonRef.bizdata.moveItem(item, value);
                    }
                }
            });

            slider.value = mesh.position.y;
            this._sliderPanel.addControl(slider);
        }
    }

    private createDeletePanel(babylonRef: RefBabylon, mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) {
        if (mesh == null) return;
        const info = mesh.name.split("_");
        const objectType = info[0];

        // clear previous delete panel to avoid delete previous mesh
        if (this._deletePanel != null) {
            this._deletePanel.dispose();
            this._deletePanel = null;
        }

        if (this._deletePanel == null && ObjectType.CUBE != objectType) {
            this._deletePanel = new GUI.Rectangle();
            this._deletePanel.width = "48px";
            this._deletePanel.height = "48px";
            this._deletePanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            this._deletePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this._deletePanel.cornerRadius = 5;
            this._deletePanel.background = "white";
            this._popupUI.addControl(this._deletePanel);

            this._deleteButton = GUI.Button.CreateImageOnlyButton(
                "deleteButton",
                "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/res/deleteButton.png",
            );
            this._deleteButton.width = "46px";
            this._deleteButton.height = "46px";
            this._deleteButton.thickness = 0;
            this._deletePanel.addControl(this._deleteButton);

            this._deleteButton.onPointerUpObservable.add(() => {
                if (mesh != null) {
                    // hide the popup ui.
                    this.display(babylonRef, null, -1, -1);
                    this._deleteButton.isVisible = false;

                    const info = mesh.name.split("_");
                    const objectType = info[0];
                    let objectID = info[1];
                    mesh.dispose();
                    switch (objectType) {
                        case ObjectType.CUBE:
                            babylonRef.bizdata.removeCube(objectID);
                            break;
                        case ObjectType.ITEM:
                            babylonRef.bizdata.removeItem(objectID);
                            break;
                        case ObjectType.DOOR:
                            {
                                const doorIndex = parseInt(info[2]);
                                babylonRef.bizdata.removeDoor(objectID, doorIndex);
                            }
                            break;
                        case ObjectType.LIGHT:
                            {
                                const map = babylonRef.spotLightMap as Map<string, BABYLON.SpotLight>;
                                let key = objectID;
                                let light = map.get(key);
                                if (light !== undefined) {
                                    light.dispose();
                                    map.delete(key);
                                } else {
                                    key = objectID + "_1";
                                    light = map.get(key);
                                    if (light !== undefined) {
                                        light.dispose();
                                        map.delete(key);
                                    }

                                    key = objectID + "_2";
                                    light = map.get(key);
                                    if (light !== undefined) {
                                        light.dispose();
                                        map.delete(key);
                                    }
                                }

                                // if having attached information, add to objectId.
                                if (info.length > 2) objectID += "_" + info[2];
                                babylonRef.bizdata.removeItem(objectID);
                            }
                            break;
                    }
                    mesh = null;
                    babylonRef.graphics.currentMesh = null;
                }
            });
            this._deletePanel.linkOffsetYInPixels = 50;
            this._deletePanel.linkWithMesh(mesh);
        }
    }

    private showSwitchCubePanel(babylonRef: RefBabylon, mesh: BABYLON.Nullable<BABYLON.AbstractMesh>) {
        // clear previous switch cube panel first
        if (this._switchCubePanel) {
            for (let i = 0; i < this._switchCubePanel.length; i++) {
                this._switchCubePanel[i].dispose();
            }

            this._switchCubePanel = [];
        }

        if (mesh === null) return;

        const info = mesh.name.split("_");
        const objectType = info[0];
        if (objectType !== ObjectType.CUBE) return;

        const bizdata = babylonRef.bizdata as BizData;
        const graphics = babylonRef.graphics as Graphics;

        bizdata.scheme.manifest.cubes.forEach((cube: Cube) => {
            const meshName = ObjectType.CUBE + "_" + cube.id;
            const cubeMesh = graphics.getMeshByName(meshName);
            if (meshName !== mesh.name && cubeMesh !== null) {
                const switchCube = new GUI.Rectangle();
                switchCube.width = "48px";
                switchCube.height = "48px";
                switchCube.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                switchCube.cornerRadius = 5;
                switchCube.background = "white";
                this._popupUI.addControl(switchCube);
                const switchCubeButton = GUI.Button.CreateImageOnlyButton(
                    "switchCubeButton",
                    "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/res/3DGestureHint.png",
                );
                switchCubeButton.width = "46px";
                switchCubeButton.height = "46px";
                switchCubeButton.thickness = 0;
                switchCube.addControl(switchCubeButton);
                switchCubeButton.onPointerUpObservable.add(() => {
                    const selectedCubeId = info[1];
                    const selectedCube = bizdata.findCubeById(selectedCubeId);
                    if (selectedCube !== undefined) {
                        const exchangedCubeIndex = bizdata.findCubeIndexById(cube.id);
                        const selectedCubeIndex = bizdata.findCubeIndexById(selectedCubeId);

                        // Add the selected cube to the index of exchanged cube.
                        bizdata.scheme.manifest.cubes.splice(exchangedCubeIndex, 0, selectedCube);
                        // Delete the exchanged cube.
                        bizdata.scheme.manifest.cubes.splice(exchangedCubeIndex + 1, 1);

                        // Add the selected cube to the index of exchanged cube.
                        bizdata.scheme.manifest.cubes.splice(selectedCubeIndex, 0, cube);
                        // Delete the exchanged cube.
                        bizdata.scheme.manifest.cubes.splice(selectedCubeIndex + 1, 1);

                        babylonRef.reloadScheme(1);
                    }
                });

                switchCube.linkWithMesh(cubeMesh);
                switchCube.linkOffsetY = 50;

                this._switchCubePanel.push(switchCube);
            }
        });
    }

    private drawRuler(
        graphics: Graphics,
        length: number,
        center: BABYLON.Vector3,
        direction: BABYLON.Vector3,
        title = "",
        size = 0,
    ): void {
        const distance = 0.1;
        const heightValue = 1 * 0.054;
        const halfHeightValue = heightValue * 0.15;
        const widthValue = 0.2 * 0.054;
        const endPointLength = 0.5 * 0.054;
        const frameRulerTop = BABYLON.MeshBuilder.CreateCylinder(
            "cylinder_up",
            { diameterTop: 0, height: heightValue, diameterBottom: endPointLength, tessellation: 16 },
            graphics.scene,
        );
        const frameRulerMiddle = BABYLON.MeshBuilder.CreateCylinder(
            "cylinder_Middle",
            { diameterTop: widthValue, height: length, diameterBottom: widthValue, tessellation: 16 },
            graphics.scene,
        );
        const frameRulerDown = BABYLON.MeshBuilder.CreateCylinder(
            "cylinder_down",
            { diameterTop: endPointLength, height: heightValue, diameterBottom: 0, tessellation: 16 },
            graphics.scene,
        );
        frameRulerMiddle.isPickable = false;
        frameRulerTop.position = center.clone();
        frameRulerMiddle.position = center.clone();
        frameRulerDown.position = center.clone();

        // length of the ruler on upside
        const lengthText = new GUI.TextBlock();
        lengthText.height = "28px";
        lengthText.color = "#000000FF";
        lengthText.fontSize = 18;
        if (size == 0) lengthText.text = length.toFixed(2) + " \u7c73";
        else lengthText.text = size.toFixed(2) + " \u7c73";
        lengthText.shadowBlur = 1;
        lengthText.shadowOffsetX = 1;
        lengthText.shadowOffsetY = 1;
        lengthText.shadowColor = "#c4d3e2";
        // lengthText.outlineWidth = 1
        // lengthText.outlineColor = "white"
        if (this._popupUI == null) {
            this._popupUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("popupGUI", true, graphics.scene);
        }

        this._popupUI.addControl(lengthText);
        lengthText.linkWithMesh(frameRulerMiddle);
        if (!title.startsWith("referenceRuler")) lengthText.linkOffsetYInPixels = -20;
        if (!title.startsWith("width") && !title.startsWith("referenceRuler")) {
            lengthText.linkOffsetXInPixels = 35;
            lengthText.linkOffsetYInPixels = -35;
        }
        lengthText.isVisible = true;

        if (title.startsWith("referenceRulerUp")) {
            if (this.referenceRulerUpTop) this.referenceRulerUpTop.dispose();
            this.referenceRulerUpTop = frameRulerTop;
            if (this.referenceRulerUpMiddle) this.referenceRulerUpMiddle.dispose();
            this.referenceRulerUpMiddle = frameRulerMiddle;
            if (this.referenceRulerUpEnd) this.referenceRulerUpEnd.dispose();
            this.referenceRulerUpEnd = frameRulerDown;
            if (this._referenceRulerTextUp) this._referenceRulerTextUp.dispose();
            this._referenceRulerTextUp = lengthText;
        }
        if (title.startsWith("referenceRulerDown")) {
            if (this.referenceRulerDownTop) this.referenceRulerDownTop.dispose();
            this.referenceRulerDownTop = frameRulerTop;
            if (this.referenceRulerDownMiddle) this.referenceRulerDownMiddle.dispose();
            this.referenceRulerDownMiddle = frameRulerMiddle;
            if (this.referenceRulerDownEnd) this.referenceRulerDownEnd.dispose();
            this.referenceRulerDownEnd = frameRulerDown;
            if (this._referenceRulerTextDown) this._referenceRulerTextDown.dispose();
            this._referenceRulerTextDown = lengthText;
        }
        if (title.startsWith("height")) {
            if (this.rulerHeightTop) this.rulerHeightTop.dispose();
            this.rulerHeightTop = frameRulerTop;
            if (this.rulerHeightMiddle) this.rulerHeightMiddle.dispose();
            this.rulerHeightMiddle = frameRulerMiddle;
            if (this.rulerHeightDown) this.rulerHeightDown.dispose();
            this.rulerHeightDown = frameRulerDown;
            if (this._rulerTextHeight) this._rulerTextHeight.dispose();
            this._rulerTextHeight = lengthText;
        }
        if (title.startsWith("width")) {
            if (this.rulerWidthTop) this.rulerWidthTop.dispose();
            this.rulerWidthTop = frameRulerTop;
            if (this.rulerWidthMiddle) this.rulerWidthMiddle.dispose();
            this.rulerWidthMiddle = frameRulerMiddle;
            if (this.rulerWidthDown) this.rulerWidthDown.dispose();
            this.rulerWidthDown = frameRulerDown;
            if (this._rulerTextWidth) this._rulerTextWidth.dispose();
            this._rulerTextWidth = lengthText;
        }
        if (title.startsWith("depth")) {
            if (this.rulerDepthTop) this.rulerDepthTop.dispose();
            this.rulerDepthTop = frameRulerTop;
            if (this.rulerDepthMiddle) this.rulerDepthMiddle.dispose();
            this.rulerDepthMiddle = frameRulerMiddle;
            if (this.rulerDepthDown) this.rulerDepthDown.dispose();
            this.rulerDepthDown = frameRulerDown;
            if (this._rulerTextDepth) this._rulerTextDepth.dispose();
            this._rulerTextDepth = lengthText;
        }

        if (direction.x === 1) {
            frameRulerTop.rotation.z = -Math.PI / 2;
            frameRulerMiddle.rotation.z = -Math.PI / 2;
            frameRulerDown.rotation.z = -Math.PI / 2;

            frameRulerTop.position.y > 0.01
                ? (frameRulerTop.position.y += distance)
                : (frameRulerTop.position.y -= distance);
            frameRulerMiddle.position.y > 0.01
                ? (frameRulerMiddle.position.y += distance)
                : (frameRulerMiddle.position.y -= distance);
            frameRulerDown.position.y > 0.01
                ? (frameRulerDown.position.y += distance)
                : (frameRulerDown.position.y -= distance);

            frameRulerTop.position.x += length / 2 - halfHeightValue;
            frameRulerDown.position.x += -length / 2 + halfHeightValue;

            frameRulerTop.position.z += distance;
            frameRulerMiddle.position.z += distance;
            frameRulerDown.position.z += distance;
        }
        if (direction.y === 1) {
            frameRulerTop.position.y += length / 2 - halfHeightValue;
            frameRulerDown.position.y += -length / 2 + halfHeightValue;

            frameRulerTop.position.x > 0
                ? (frameRulerTop.position.x += distance)
                : (frameRulerTop.position.x -= distance);
            frameRulerMiddle.position.x > 0
                ? (frameRulerMiddle.position.x += distance)
                : (frameRulerMiddle.position.x -= distance);
            frameRulerDown.position.x > 0
                ? (frameRulerDown.position.x += distance)
                : (frameRulerDown.position.x -= distance);

            frameRulerTop.position.z += distance;
            frameRulerMiddle.position.z += distance;
            frameRulerDown.position.z += distance;
        }
        if (direction.z === 1) {
            frameRulerTop.rotation.x = -Math.PI / 2;
            frameRulerMiddle.rotation.x = -Math.PI / 2;
            frameRulerDown.rotation.x = -Math.PI / 2;

            frameRulerTop.position.z += -length / 2 + halfHeightValue;
            frameRulerDown.position.z += length / 2 - halfHeightValue;

            frameRulerTop.position.x -= distance;
            frameRulerMiddle.position.x -= distance;
            frameRulerDown.position.x -= distance;
        }
        const frameRulerMat = new BABYLON.StandardMaterial("frameRulerMat", graphics.scene);
        frameRulerMat.emissiveColor = new BABYLON.Color3(0.0, 0.0, 0.0);
        frameRulerMat.disableLighting = true;
        frameRulerTop.material = frameRulerMat;
        frameRulerMiddle.material = frameRulerMat;
        frameRulerDown.material = frameRulerMat;
    }

    public showRuler(
        graphics: Graphics,
        bizdata: BizData,
        isDisplay: boolean,
        sizeHeight = 0,
        sizeWidth = 0,
        sizeDepth = 0,
    ) {
        this.rulerDisplayed = isDisplay;

        if (!isDisplay) {
            if (this._rulerTextDepth) this._rulerTextDepth.dispose();
            if (this._rulerTextHeight) this._rulerTextHeight.dispose();
            if (this._rulerTextWidth) this._rulerTextWidth.dispose();
            if (this.rulerHeightTop) this.rulerHeightTop.dispose();
            if (this.rulerDepthTop) this.rulerDepthTop.dispose();
            if (this.rulerWidthTop) this.rulerWidthTop.dispose();
            if (this.rulerHeightDown) this.rulerHeightDown.dispose();
            if (this.rulerDepthDown) this.rulerDepthDown.dispose();
            if (this.rulerWidthDown) this.rulerWidthDown.dispose();
            if (this.rulerHeightMiddle) this.rulerHeightMiddle.dispose();
            if (this.rulerDepthMiddle) this.rulerDepthMiddle.dispose();
            if (this.rulerWidthMiddle) this.rulerWidthMiddle.dispose();
            return;
        }
        if (sizeHeight == 0)
            this.drawRuler(
                graphics,
                bizdata.totalHeight,
                new BABYLON.Vector3(bizdata.endX, bizdata.totalHeight / 2, bizdata.totalDepth / 2),
                new BABYLON.Vector3(0, 1, 0),
                "height ",
            );
        else
            this.drawRuler(
                graphics,
                bizdata.totalHeight,
                new BABYLON.Vector3(bizdata.endX, bizdata.totalHeight / 2, bizdata.totalDepth / 2),
                new BABYLON.Vector3(0, 1, 0),
                "height ",
                sizeHeight,
            );
        if (sizeWidth == 0)
            this.drawRuler(
                graphics,
                bizdata.totalWidth,
                new BABYLON.Vector3((bizdata.startX + bizdata.endX) / 2, bizdata.totalHeight, bizdata.totalDepth / 2),
                new BABYLON.Vector3(1, 0, 0),
                "width ",
            );
        else
            this.drawRuler(
                graphics,
                bizdata.totalWidth,
                new BABYLON.Vector3((bizdata.startX + bizdata.endX) / 2, bizdata.totalHeight, bizdata.totalDepth / 2),
                new BABYLON.Vector3(1, 0, 0),
                "width ",
                sizeWidth,
            );
        if (sizeDepth == 0)
            this.drawRuler(
                graphics,
                bizdata.totalDepth,
                new BABYLON.Vector3(bizdata.endX, 0.01, 0),
                new BABYLON.Vector3(0, 0, 1),
                "depth ",
            );
        else
            this.drawRuler(
                graphics,
                bizdata.totalDepth,
                new BABYLON.Vector3(bizdata.endX, 0.01, 0),
                new BABYLON.Vector3(0, 0, 1),
                "depth ",
                sizeDepth,
            );
    }
}
