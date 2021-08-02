import { v4 as uuidv4 } from "uuid";
import StBabylonUtil from "./st_babylon_util";
import { StSketchPolygon, StSketchRect } from "../geometry/st_geometric_2d";
import { StIBuild3d } from "../utility/st_build3d_interface";
import { StMaterial } from "../utility/st_material";
import { St3DEngine } from "../utility/st_3d_engine";
import StSketchConstant from "../utility/st_sketch_constant";

const ST_SCALE_FROM_MM = StSketchConstant.SCALE_FROM_MM;

export class StBabylonBuild3d implements StIBuild3d {
    readonly engine: St3DEngine;
    readonly scene: BABYLON.Scene;

    constructor(opt: { scene: BABYLON.Scene }) {
        this.engine = St3DEngine.BABYLON_JS;
        this.scene = opt.scene;
        if (!this.scene) {
            throw Error("Scene is NOT defined!");
        }
    }

    createTiledBox(rect: StSketchRect, depthZ: number, mat: StMaterial): [string, BABYLON.Mesh] {
        if (!mat.texture) {
            throw Error("Material has no texture!");
        }
        const mat1 = new BABYLON.StandardMaterial(mat.name, this.scene);
        //mat1.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/bricktile.jpg", this.scene);
        console.log(`texture file: ${mat.texture.file}`);
        mat1.diffuseTexture = new BABYLON.Texture(mat.texture.file, this.scene);

        const width = rect.a / ST_SCALE_FROM_MM;
        const height = rect.b / ST_SCALE_FROM_MM;
        const depth = depthZ / ST_SCALE_FROM_MM;

        const pat = BABYLON.Mesh.FLIP_TILE;
        const av = BABYLON.Mesh.TOP;
        const ah = BABYLON.Mesh.LEFT;
        const options = {
            // [2021-7-27 Guilin] test FRONTSIDE
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            pattern: pat,
            alignVertical: av,
            alignHorizontal: ah,
            width: width,
            height: height,
            depth: depth,
            tileSize: 1, // ??
            tileWidth: 1,
        };
        const mesh_id = uuidv4();
        const tiled_box = BABYLON.MeshBuilder.CreateTiledBox(mesh_id, options);
        tiled_box.material = mat1;
        return [mesh_id, tiled_box];
    }

    createCylindar(radius: number, height: number): [string, BABYLON.Mesh] {
        const mesh_id = uuidv4();
        const mesh = BABYLON.MeshBuilder.CreateCylinder(mesh_id, {
            diameter: (radius * 2) / ST_SCALE_FROM_MM,
            height: height / ST_SCALE_FROM_MM,
        });
        return [mesh_id, mesh];
    }

    extrudeShape(polygon: StSketchPolygon, depthZ: number, mat?: StMaterial): [string, BABYLON.Mesh] {
        const myShape = StBabylonUtil.toScaledVector3(polygon.points);
        const myPath = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, depthZ / ST_SCALE_FROM_MM)];
        const options = {
            shape: myShape, // vec3 array with z = 0,
            path: myPath, // vec3 array
            updatable: true,
            cap: BABYLON.Mesh.CAP_ALL,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        };
        const mesh_id = uuidv4();
        const extruded = BABYLON.MeshBuilder.ExtrudeShape(mesh_id, options, this.scene);
        if (mat && mat.texture) {
            const mat1 = new BABYLON.StandardMaterial(mat.name, this.scene);
            mat1.diffuseTexture = new BABYLON.Texture(mat.texture.file, this.scene);
            if (mat1.diffuseTexture instanceof BABYLON.Texture) {
                // TODO: use correct U & V
                mat1.diffuseTexture.uScale = 2;
                mat1.diffuseTexture.vScale = 4;
            }
            extruded.material = mat1;
        }
        return [mesh_id, extruded];
    }
}
