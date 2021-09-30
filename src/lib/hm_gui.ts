import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import { Graphics } from "@/lib/graphics";
import { BizData, ObjectType } from "@/lib/biz.data";

export class PopupGUI {
    public rulerDisplayed = false;
    private _popupUI!: GUI.AdvancedDynamicTexture;
    private _popupPanel!: GUI.Container;
    private _deletePanel: BABYLON.Nullable<GUI.Rectangle> = null;
    private _deleteButton!: GUI.Button;

    private _sliderPanel: BABYLON.Nullable<GUI.StackPanel> = null;
    private _grid: BABYLON.Nullable<GUI.Grid> = null;

    private _loadingPanel: BABYLON.Nullable<GUI.Rectangle> = null;
    private _loadingInfo: BABYLON.Nullable<GUI.TextBlock> = null;
    private _loadingSlider: BABYLON.Nullable<GUI.Slider> = null;
    private _loadingHintInfo: BABYLON.Nullable<GUI.TextBlock> = null;

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

    public loading(graphics: Graphics) {
        // GUI
        if (this._popupUI == null) {
            this._popupUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("popupGUI", true, graphics.scene);
        }
        // console.log('=================> setup ui')

        // Level one panel : undo redo all clear
        if (this._loadingPanel == null) {
            this._loadingPanel = new GUI.Rectangle()
            this._loadingPanel.width = '528px'
            this._loadingPanel.height = '181px'
            this._loadingPanel.color = '#EAE7EAFF'
            this._loadingPanel.background = 'white'
            this._loadingPanel.cornerRadius = 4
            this._loadingPanel.thickness = 1
            //  this._loadingPanel.isVertical = false
            this._popupUI.addControl(this._loadingPanel)

            this._loadingInfo = new GUI.TextBlock()
            this._loadingInfo.text = '衣柜加载中…'
            this._loadingInfo.width = '144px'
            this._loadingInfo.height = '32px'
            this._loadingInfo.fontStyle = 'bold'
            this._loadingInfo.fontSize = 24
            this._loadingInfo.color = 'black'
            //  this._loadingInfo.isVertical = false
            this._loadingInfo.top = 34
            this._loadingInfo.left = 44
            this._loadingInfo.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
            this._loadingInfo.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
            this._loadingPanel.addControl(this._loadingInfo)

            this._loadingSlider = new GUI.Slider()
            this._loadingSlider.left = 44
            this._loadingSlider.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
            this._loadingSlider.minimum = 0
            this._loadingSlider.maximum = 1
            this._loadingSlider.value = 0.55
            this._loadingSlider.isThumbClamped = true
            this._loadingSlider.isVertical = false
            this._loadingSlider.displayThumb = false
            this._loadingSlider.height = '24px'
            this._loadingSlider.width = '455px'
            this._loadingSlider.background = '#E5EEF5FF'
            this._loadingSlider.color = '#0058A3FF'
            this._loadingPanel.addControl(this._loadingSlider)

            this._loadingHintInfo = new GUI.TextBlock()
            this._loadingHintInfo.text = '小贴士：进行测量时，确保距离天花板还有9厘米的高度'
            this._loadingHintInfo.width = '402px'
            this._loadingHintInfo.height = '24px'
            this._loadingHintInfo.fontSize = 16
            this._loadingHintInfo.color = 'gray'
            //  this._loadingHintInfo.isVertical = false
            this._loadingHintInfo.top = -24
            this._loadingHintInfo.left = 44
            this._loadingHintInfo.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
            this._loadingHintInfo.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
            this._loadingPanel.addControl(this._loadingHintInfo)
        }
        if (this._loadingSlider) {
            // this._loadingSlider.value = this.loadedTemplateMeshCount / this.needToLoadCount
            // if (this._loadingSlider.value === 1) {
            setTimeout(() => {
                if (this._loadingPanel)
                    this._loadingPanel.dispose()
                this._loadingPanel = null
            }, 3500)
            // }
        }
    }

    private displayPanel(graphics: Graphics, bizdata: BizData, mesh: BABYLON.Nullable<BABYLON.AbstractMesh>, min: number, max: number): void {
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
            return;
        }

        if (this._popupUI == null) {
            this._popupUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI("popupGUI", true, graphics.scene);
        }

        // clear previous silder panel to avoid adjust previous mesh
        if (this._sliderPanel != null) {
            this._sliderPanel.dispose();
            this._sliderPanel = null;
        }
        const info = mesh.name.split("_");
        const objectType = info[0];

        if (this._sliderPanel == null && ObjectType.ITEM == objectType) {

            this._grid = new GUI.Grid();
            this._popupUI.addControl(this._grid);

            // TO DO : silder position code 
            this._grid.addColumnDefinition(0.5);
            this._grid.addColumnDefinition(0.5);
            this._grid.addRowDefinition(0.25);
            this._grid.addRowDefinition(0.5);
            this._grid.addRowDefinition(0.25);

            this._sliderPanel = new GUI.StackPanel();
            this._sliderPanel.width = "320px";
            this._grid.addControl(this._sliderPanel, 1, 0);

            var header = new GUI.TextBlock();
            header.text = "调整物体位置";
            header.height = "30px";
            header.color = "black";
            this._sliderPanel.addControl(header);

            var slider = new GUI.ImageBasedSlider();
            slider.minimum = min;
            slider.maximum = max;
            slider.isVertical = true;
            slider.isThumbClamped = true;
            slider.displayThumb = true;
            slider.width = "22px";
            const sildHeight = ((slider.maximum - slider.minimum) * 100).toFixed(0);
            slider.height = ( parseInt(sildHeight) < 150 ) ? 150 + "px" : sildHeight + "px";
            slider.backgroundImage = new GUI.Image("back", "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/img/backgroundImage-vertical.png");
            slider.valueBarImage = new GUI.Image("value", "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/img/valueImage-vertical.png");
            slider.thumbImage = new GUI.Image("thumb", "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/img/thumb.png");

            slider.onValueChangedObservable.add((value: number) => {
                if (mesh) mesh.position.y = value;
                header.text = " " + value.toFixed(2) + " \u7c73";
            });

            slider.value = mesh.position.y;
            this._sliderPanel.addControl(slider);
        }


        // clear previous delete panel to avoid delete previous mesh
        if (this._deletePanel != null) {
            this._deletePanel.dispose();
            this._deletePanel = null;
        }

        if (this._deletePanel == null && ObjectType.CUBE != objectType) {
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
                    this.displayPanel(graphics, bizdata, null, -1, -1);
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
                            {
                                const doorIndex = parseInt(info[2]);
                                bizdata.removeDoor(objectID, doorIndex);
                            }
                            break;
                    }
                    mesh = null;
                }
            });
            this._deletePanel.linkWithMesh(mesh);
        }

    }

    private drawRuler(graphics: Graphics, length: number, center: BABYLON.Vector3, direction: BABYLON.Vector3, title = ""): void {
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
        lengthText.text = length + " \u7c73";
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
        if (!title.startsWith("width")) {
            lengthText.linkOffsetXInPixels = 75;
            lengthText.linkOffsetYInPixels = -35;
        }
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

    public display(graphics: Graphics, bizdata: BizData, pickedMesh: BABYLON.Nullable<BABYLON.AbstractMesh>, min: number = -1, max: number = -1) {
        this.displayPanel(graphics, bizdata, pickedMesh, min, max);
    }

    public showRuler(graphics: Graphics, bizdata: BizData, isDisplay: boolean, sizeHeight: number = 0, sizeWidth: number = 0, sizeDepth: number = 0) {
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
                sizeHeight,
                new BABYLON.Vector3(bizdata.endX, bizdata.totalHeight / 2, bizdata.totalDepth / 2),
                new BABYLON.Vector3(0, 1, 0),
                "height ",
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
                sizeWidth,
                new BABYLON.Vector3((bizdata.startX + bizdata.endX) / 2, bizdata.totalHeight, bizdata.totalDepth / 2),
                new BABYLON.Vector3(1, 0, 0),
                "width ",
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
                sizeDepth,
                new BABYLON.Vector3(bizdata.endX, 0.01, 0),
                new BABYLON.Vector3(0, 0, 1),
                "depth ",
            );
    }
}
