/**
 * @file    st_mesh_object.ts
 * @author 	Guilin
 *
 * @description Implementation of common 3D meshes.
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-24] Created.
 *
 */

import { StSketchPolygon } from "../geometry/st_geometric_2d";
import { StSketchVector3, StBoundaryBox, StPoint3 } from "../geometry/st_geometric_3d";
import { StObject } from "../utility/st_object";
import { StIMesh, StIOnsiteMesh, StIPrefabMesh } from "./st_mesh_interface";
import StSketchConstant from "../utility/st_sketch_constant";
import { StTexture } from "../utility/st_texture";
import { StColor } from "../utility/st_color";
import { StIBuild3d } from "../utility/st_build3d_interface";
import { StBabylonBuild3d } from "../babylonjs/st_babylon_build3d";
import { StMaterial } from "../utility/st_material";
import { sketchEngine } from "../utility/st_sketch_engine";

// normal vectors for X, Y, Z
const NORMAL_X = StSketchConstant.NORMAL_X;
const NORMAL_Y = StSketchConstant.NORMAL_Y;
const NORMAL_Z = StSketchConstant.NORMAL_Z;
//const ST_PRE = StSketchConstant.ST_PREFIX;
const ST_SCALE_FROM_MM = StSketchConstant.SCALE_FROM_MM;

export { StSketchMesh, StPrefabMesh, StOnsiteMesh, StPillarMesh, StCylindarMesh };

/**
 * Accesotor of all 3D mesh objects
 *
 * The position is defined in the WORLD space.
 */
abstract class StSketchMesh extends StObject implements StIMesh {
    /**
     * position in current space (usually, the WORLD space);
     */
    private position: StSketchVector3;

    /**
     * mesh is set by createMesh() or loadMesh() in sub-class
     */
    protected mesh?: BABYLON.Mesh;

    protected build3d: StIBuild3d;
    protected readonly scene: BABYLON.Scene;
    protected readonly space: BABYLON.Space;

    /**
     *
     * @param obj
     */
    //constructor(obj: any);
    constructor(obj: { position: StSketchVector3; space?: BABYLON.Space }) {
        super();
        this.position = obj.position;
        this.scene = sketchEngine.getRoom().scene as BABYLON.Scene;
        this.space = obj.space || BABYLON.Space.WORLD;
        this.build3d = new StBabylonBuild3d({ scene: this.scene });
    }

    getPosition(): StSketchVector3 {
        return this.position.clone();
    }

    setVisible(v: number): void {
        if (v < 0 || 1 < v) {
            throw Error("visiable must be 0-1");
        }
        if (!this.mesh) {
            throw Error("Mesh is not defined");
        }
        this.mesh.visibility = v;
    }
    getVisible(): number {
        if (!this.mesh) {
            throw Error("Mesh is not defined");
        }
        return this.mesh.visibility;
    }
    rotateY(angle: number): void {
        if (!this.mesh) {
            throw Error("Mesh is not defined");
        }
        this.mesh.rotate(BABYLON.Axis.Y, angle, this.space);
    }
    rotateX(angle: number): void {
        if (!this.mesh) {
            throw Error("Mesh is not defined");
        }
        this.mesh.rotate(BABYLON.Axis.X, angle, this.space);
    }

    /**
     * @todo: [guilin: 2021-7-28] Currently, DO NOT call this method!!
     * @param pivot_point
     */
    setPivot(pivot_point: StPoint3): void {
        const pivot = pivot_point.scaleToBabylon();
        this.mesh?.setPivotPoint(pivot);
        console.warn(
            `DO NOT call this method! -- mesh position: ${this.mesh?.position}, pivot: ${this.mesh?.getPivotPoint()}`,
        );
    }

    /**
     * [Guilin: 2021-7-28] Bug: fail to correctly translate  a board, which is a tiled-box that has been translated and rotated
     * DO NOTt translate a mesh, if it has been rotated.
     *
     * @param vec
     * @param update_pos set 'false', if it is called in createMesh()/loadMesh() in sub-class, to move the mesh to a specified position
     */
    translate(vec: StSketchVector3, update_pos = true): void {
        if (!this.mesh) {
            throw Error("Mesh is not defined");
        }
        const space = this.space;
        if (vec.x != 0) this.mesh.translate(NORMAL_X, vec.x / ST_SCALE_FROM_MM, space);
        if (vec.y != 0) this.mesh.translate(NORMAL_Y, vec.y / ST_SCALE_FROM_MM, space);
        if (vec.z != 0) this.mesh.translate(NORMAL_Z, vec.z / ST_SCALE_FROM_MM, space);
        if (update_pos) {
            this.position.selfAdd(vec);
        }
    }
    deleteMesh(): void {
        if (!this.mesh) {
            return;
            //throw Error("Mesh is not defined");
        }
        this.mesh.dispose();
        this.mesh = undefined;
    }
    getBoundaryBox(): StBoundaryBox {
        if (!this.mesh) {
            throw Error("Mesh is not defined");
        }
        throw Error("TODO");
        // const box = this.mesh.getBoundingInfo().boundingBox;
    }

    /**
     * called in createMesh()/loadMesh() in sub-class, to move the mesh to a specified position
     */
    protected onAddedMesh(/*pivot?: StPoint3*/): void {
        this.translate(this.position, false);
    }

    __getMesh(): BABYLON.Mesh {
        if (!this.mesh) {
            throw Error("Mesh is not defined");
        }
        return this.mesh;
    }
}

/**
 * The 3D object is loaded from a *.glb fille.
 */
class StPrefabMesh extends StSketchMesh implements StIPrefabMesh {
    loadMesh(): string {
        throw new Error("Method not implemented.");
    }
}

/**
 * The 3D object is created by parameters
 */
abstract class StOnsiteMesh extends StSketchMesh implements StIOnsiteMesh {
    protected color?: StColor;
    protected texture?: StTexture;

    //constructor(obj: any);
    constructor(obj: { position: StSketchVector3; space?: BABYLON.Space; color?: StColor; texture?: StTexture }) {
        super(obj);
        this.color = obj.color;
        this.texture = obj.texture;
    }
    setColor(color: StColor): void {
        this.color = color;
        throw new Error("Method not implemented. TODO: Change the mesh...");
    }
    getColor(): StColor | undefined {
        return this.color;
    }
    setTexture(txt: StTexture): void {
        this.texture = txt;
        throw new Error("Method not implemented. TODO: Change the mesh...");
    }
    getTexture(): StTexture | undefined {
        return this.texture;
    }
    abstract createMesh(): string;
}

/**
 * Onsite 3D object: Pillar
 */
class StPillarMesh extends StOnsiteMesh {
    readonly polygon: StSketchPolygon;
    readonly depth: number;

    constructor(obj: {
        position: StSketchVector3;
        space?: BABYLON.Space;
        color?: StColor;
        texture?: StTexture;
        polygon: StSketchPolygon;
        depth: number;
    }) {
        super(obj);
        this.polygon = obj.polygon;
        this.depth = obj.depth;
    }

    createMesh(): string {
        const mat = new StMaterial({ name: "_st_default_mat" });
        let uuid: string;
        [uuid, this.mesh] = this.build3d.extrudeShape(this.polygon, this.depth, mat);
        this.onAddedMesh();
        return uuid;
    }
}

/**
 * Onsite 3D object: Cylindar
 */
class StCylindarMesh extends StOnsiteMesh {
    readonly radius: number;
    readonly depth: number;

    // constructor(obj: any);
    constructor(obj: {
        position: StSketchVector3;
        space?: BABYLON.Space;
        color?: StColor;
        texture?: StTexture;
        radius: number;
        depth: number;
    }) {
        super(obj);
        this.radius = obj.radius;
        this.depth = obj.depth;
    }

    createMesh(): string {
        let uuid: string;
        [uuid, this.mesh] = this.build3d.createCylindar(this.radius, this.depth);
        this.translate(new StSketchVector3(this.radius, this.radius, this.depth / 2), false);
        this.onAddedMesh();
        return uuid;
    }
}
