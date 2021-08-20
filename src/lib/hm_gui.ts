import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import { Graphics } from "@/lib/graphics";
import { BizData, CubeData } from "@/lib/biz.data";


export class PopupGUI {
    private _popupUI!: GUI.AdvancedDynamicTexture;
    private _popupPanel!: GUI.Container;
    private _deletePanel: BABYLON.Nullable<GUI.Rectangle> = null;
    private _deleteButton!: GUI.Button;

    private displayPanel(graphics: Graphics, mesh: BABYLON.Nullable<BABYLON.AbstractMesh>): void {
        //  hide GUI when click empty area
        if (mesh == null){
            if (this._deletePanel) {
                this._deletePanel.dispose();
                this._deletePanel = null;
            }
            return
        }

        if (this._popupUI == null) {
            this._popupUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI('popupGUI', true, graphics.scene);
        }

        if (this._deletePanel == null){
            this._deletePanel = new GUI.Rectangle();
            this._deletePanel.width = '30px';
            this._deletePanel.height = '30px';
            this._deletePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this._deletePanel.cornerRadius = 5;
            this._deletePanel.background = 'white';
            this._popupUI.addControl(this._deletePanel);       
            
            this._deleteButton = GUI.Button.CreateImageOnlyButton('deleteButton', "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/res/deleteButton.png");
            this._deleteButton.width = '28px';
            this._deleteButton.height = '28px';
            this._deleteButton.thickness = 0;
            this._deletePanel.addControl(this._deleteButton);

            this._deleteButton.onPointerUpObservable.add(() => {
                if (mesh != null) {
                    // hide the popup ui.
                    this.displayPanel(graphics, null);
                    this._deleteButton.isVisible = false;
                    // Todo, use common delete function to delete items
                    if(mesh.parent)
                        mesh.parent.dispose();
                    else
                        mesh.dispose();
                    mesh = null;
                }
            });
        }
        this._deletePanel.linkWithMesh(mesh);
    }

    public display(graphics: Graphics, pickedMesh: BABYLON.Nullable<BABYLON.AbstractMesh>) {
        this.displayPanel(graphics, pickedMesh);
    }
}