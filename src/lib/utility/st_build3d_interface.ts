/**
 * @file    st_build3d_interface.ts
 * @author  Guilin
 * 
 * @description  utility to build a 3D object. e.g. extrudeShape(), createTiledBox()
 * 
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-27] Created. 
 * 
 */

import { StSketchPolygon, StSketchRect } from "../geometry/st_geometric_2d";
import { St3DEngine } from "./st_3d_engine";
import { StMaterial } from "./st_material";

export {StIBuild3d};

interface StIBuild3d {
    readonly engine: St3DEngine;
    
    /**
     * @param shape 
     * @param depthZ 
     * @param mat 
     * 
     * @returns [UUID, MeshObject] of the newly created 3D object
     */
    extrudeShape(shape: StSketchPolygon, depthZ: number, mat: StMaterial): [string, any] ;

    createTiledBox(rect: StSketchRect, depthZ: number, mat: StMaterial): [string, any] ;

    createCylindar(radius:number, height:number): [string, any] ;
}
