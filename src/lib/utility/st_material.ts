/**
 * @file    st_material.ts
 * @author  Guilin
 * 
 * @description A simple material wrapper
 * 
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-27] Created. 
 * 
 */

import { StColor } from "./st_color";
import { StObject } from "./st_object";
import { StTexture, StWoodType, textureManager } from "./st_texture";

export class StMaterial extends StObject {
    static OAK_01 = new StMaterial({
        texture: textureManager.wood(StWoodType.OAK, 0),
        name: '_st_default_mat_oak-01',
        });
    static OAK_02 = new StMaterial({
        texture: textureManager.wood(StWoodType.OAK, 1),
        name: '_st_default_mat_oak-01',
        });


    readonly name: string;
    readonly texture?: StTexture;
    readonly color?:StColor;

    constructor(obj: any)
    constructor(obj: StMaterial){
        super();
        this.texture = obj && obj.texture;
        this.name = obj && obj.name;
    }
}
