/**
 * @file    st_texture.ts
 * @author  Guilin
 *
 * @description A simple texture wrapper
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-27] Created.
 *
 */

import { StObject } from "./st_object";

export enum StWoodType {
    NONE,
    OAK,
    PINE,
    CHERRY,
}

export class StTexture {
    readonly file: string;

    constructor(f: string) {
        this.file = f;
    }
}

class StTextureManager extends StObject {
    private readonly woodOak: string[] = [
        require("@/assets/texture/wood/oak-01.png"),
        require("@/assets/texture/wood/oak-02.jpg"),
    ];
    private readonly woodPine: string[] = [
        require("@/assets/texture/wood/pine-01.jpg"),
        require("@/assets/texture/wood/pine-02.jpg"),
    ];

    constructor() {
        super();
    }

    private _getGroup(type: StWoodType): string[] {
        if (type == StWoodType.OAK) {
            return this.woodOak;
        }
        if (type == StWoodType.PINE) {
            return this.woodPine;
        }
        throw Error(`Unknown Type: ${type}`);
    }

    wood(type: StWoodType, id: number): StTexture {
        const grp = this._getGroup(type);
        return new StTexture(grp[id]);
    }
}

export const textureManager = new StTextureManager();
