/**
 * @file    st_board_mesh.ts
 * @author 	Guilin
 *
 * @description 3D Mesh: A Simple Board
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-28] Created.
 *
 */

import { StSketchLine, StSketchPoint, StSketchPolygon, StSketchRect } from "../geometry/st_geometric_2d";
import { StSketchVector3 } from "../geometry/st_geometric_3d";
import { StTexture, StWoodType, textureManager } from "../utility/st_texture";
import { StColor } from "../utility/st_color";
import { StMaterial } from "../utility/st_material";
import { StOnsiteMesh } from "./st_mesh_object";
import StBabylonUtil from "../babylonjs/st_babylon_util";
import { StBoardMeshLocation } from "./st_model_interface";

export enum StBoardType {
    FACE,
    VERTCAL,
    HORIZONAL,
}

/**
 * a board that parallels with Z axis
 */
export class StLineBoardMesh extends StOnsiteMesh {
    private readonly poly: StSketchPolygon;
    private readonly depth: number;

    static buildByLine(
        line: StSketchLine,
        depth: number,
        meshLoc: StBoardMeshLocation,
        thickness?: number,
    ): StLineBoardMesh {
        if (meshLoc != StBoardMeshLocation.LEFT) {
            throw Error(`Only LEFT Location is supported! Input Location: ${meshLoc}`);
        }
        const rect: StSketchRect = StSketchRect.buildRectByLineAtLeft(line, thickness || 20);
        const texture = textureManager.wood(StWoodType.OAK, 0);
        const b1 = new StLineBoardMesh({
            position: new StSketchVector3(0, 0, 0),
            depth: depth,
            texture: texture,
            poly: rect,
        });
        b1.createMesh();
        return b1;
    }

    createMesh(): string {
        const mat_name = "_st_mat_003";
        const mat_texture = this.texture;
        const mat = new StMaterial({
            name: mat_name,
            texture: mat_texture,
        });
        [this.meshId, this.mesh] = this.build3d.extrudeShape(this.poly, this.depth, mat);
        if (!this.mesh) throw Error("Fail to create mesh");

        this.onAddedMesh();
        return this.meshId;
    }

    constructor(obj: {
        position: StSketchVector3;
        space?: BABYLON.Space;
        color?: StColor;
        type?: StBoardType;
        texture?: StTexture;
        poly: StSketchPolygon;
        depth: number;
    }) {
        super(obj);
        this.poly = obj.poly;
        this.depth = obj.depth;
    }
}

/**
 * Onsite 3D object: Tiled Box
 */
export class StBoardMesh extends StOnsiteMesh {
    static buildSideBoard(width: number, height: number, thickness = 20, texture?: StTexture): StBoardMesh {
        return this.buildBoard(width, height, thickness, StBoardType.VERTCAL, texture);
    }

    static buildHorizonalBoard(width: number, height: number, thickness = 20, texture?: StTexture): StBoardMesh {
        return this.buildBoard(width, height, thickness, StBoardType.HORIZONAL, texture);
    }

    static buildBoard(
        width: number,
        height: number,
        thickness = 20,
        type?: StBoardType,
        /* beta?: number,*/ texture?: StTexture,
        color?: StColor,
    ): StBoardMesh {
        if (!texture) {
            texture = textureManager.wood(StWoodType.OAK, 0);
        }
        const rect: StSketchRect = StSketchRect.buildRectByStartPoint(new StSketchPoint(0, 0), width, height);
        const b1 = new StBoardMesh({
            position: new StSketchVector3(0, 0, 0),
            rect: rect,
            depth: thickness,
            texture: texture,
            type: type,
            color: color,
        });
        b1.createMesh();
        return b1;
    }

    readonly rect: StSketchRect;
    readonly depth: number;
    readonly type: StBoardType;

    // constructor(obj: any);
    constructor(obj: {
        position: StSketchVector3;
        space?: BABYLON.Space;
        color?: StColor;
        type?: StBoardType;
        texture: StTexture;
        rect: StSketchRect;
        depth: number;
    }) {
        super(obj);
        this.type = obj.type || StBoardType.FACE;
        this.rect = obj.rect;
        this.depth = obj.depth;
    }

    createMesh(): string {
        const mat_name = "_st_mat_003";
        const mat_texture = this.texture;
        const mat = new StMaterial({
            name: mat_name,
            texture: mat_texture,
        });
        [this.meshId, this.mesh] = this.build3d.createTiledBox(this.rect, this.depth, mat);
        if (!this.mesh) throw Error("Fail to create mesh");
        //console.debug(`##1. mesh position: ${this.mesh?.position}, pivot: ${this.mesh?.getPivotPoint()}`);
        const trans = new StSketchVector3(this.rect.a / 2, this.rect.b / 2, this.depth / 2);
        if (this.type == StBoardType.VERTCAL) {
            this.rotateY(Math.PI / -2);
        } else if (this.type == StBoardType.HORIZONAL) {
            this.rotateX(Math.PI / 2);
        } else {
            console.log(`## do nothing for ${StBoardType[this.type]}`);
        }
        StBabylonUtil.translate(this.mesh, trans);
        //this.translate(trans, false);
        // [Guilin: 2021-7-28] changing pivot causes unexpected translation in WORLD space.
        // ATTENTION: I do not fully understand PIVOT :(
        // this.setPivot(trans.multiple(-1));
        this.onAddedMesh();
        return this.meshId;
    }
}
