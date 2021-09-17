import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import { Graphics } from "@/lib/graphics";
import { BizData, CubeData, ObjectType } from "@/lib/biz.data";
import { Vector3 } from "babylonjs/Maths/math.vector";

export class PopupGUI {
    private _popupUI!: GUI.AdvancedDynamicTexture;
    private _popupPanel!: GUI.Container;
    private _deletePanel: BABYLON.Nullable<GUI.Rectangle> = null;
    private _deleteButton!: GUI.Button;
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

    private displayPanel(graphics: Graphics, bizdata: BizData, mesh: BABYLON.Nullable<BABYLON.AbstractMesh>): void {
        //  hide GUI when click empty area
        if (mesh == null) {
            if (this._deletePanel) {
                this._deletePanel.dispose();
                this._deletePanel = null;
            }
            return;
        }

        if (this._popupUI == null) {
            this._popupUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("popupGUI", true, graphics.scene);
        }

        if (this._deletePanel == null) {
            this._deletePanel = new GUI.Rectangle();
            this._deletePanel.width = "48px";
            this._deletePanel.height = "48px";
            this._deletePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
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
                    this.displayPanel(graphics, bizdata, null);
                    this._deleteButton.isVisible = false;

                    const info = mesh.name.split("_");
                    const objectType = info[0];
                    const objectID = info[1];
                    mesh.dispose();
                    switch (objectType) {
                        case ObjectType.CUBE:
                            bizdata.removeCube(objectID);
                            break;
                        case ObjectType.ITEM:
                            bizdata.removeItem(objectID);
                            break;
                        case ObjectType.DOOR:
                            bizdata.removeDoor(objectID);
                            break;
                    }
                    mesh = null;
                }
            });
        }
        this._deletePanel.linkWithMesh(mesh);
    }

    private drawRuler(graphics: Graphics, length: number, center: Vector3, direction: Vector3, title = ""): void {
        const distance = 0.05;
        const heightValue = 1 * 0.054;
        const halfHeightValue = heightValue * 0.0005;
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
        lengthText.text = length + " mm";
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
        lengthText.linkOffsetYInPixels = -20;
        if (!title.startsWith("width")) lengthText.linkOffsetXInPixels = 45;
        lengthText.isVisible = true;

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
        }
        const frameRulerMat = new BABYLON.StandardMaterial("frameRulerMat", graphics.scene);
        frameRulerMat.emissiveColor = new BABYLON.Color3(0.0, 0.0, 0.0);
        frameRulerMat.disableLighting = true;
        frameRulerTop.material = frameRulerMat;
        frameRulerMiddle.material = frameRulerMat;
        frameRulerDown.material = frameRulerMat;
    }

    public display(graphics: Graphics, bizdata: BizData, pickedMesh: BABYLON.Nullable<BABYLON.AbstractMesh>) {
        this.displayPanel(graphics, bizdata, pickedMesh);
    }

    public showRuler(graphics: Graphics, bizdata: BizData, isDisplay: boolean) {
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
        this.drawRuler(
            graphics,
            bizdata.totalHeight,
            new BABYLON.Vector3(-bizdata.totalWidth / 2, bizdata.totalHeight / 2, bizdata.totalDepth / 2),
            new BABYLON.Vector3(0, 1, 0),
            "height ",
        );
        this.drawRuler(
            graphics,
            bizdata.totalWidth,
            new BABYLON.Vector3(0, bizdata.totalHeight, bizdata.totalDepth / 2),
            new BABYLON.Vector3(1, 0, 0),
            "width ",
        );
        this.drawRuler(
            graphics,
            bizdata.totalDepth,
            new BABYLON.Vector3(-bizdata.totalWidth / 2 - 0.05, 0.01, 0),
            new BABYLON.Vector3(0, 0, 1),
            "depth ",
        );
    }
}
