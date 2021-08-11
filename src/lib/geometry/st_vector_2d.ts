/**
 * @file    st_sketch_vector.ts
 * @author  guilin
 *
 * @description  Algorithm for 2D vector
 *
 * ------------------ logs -----------------------------------------------------
 * [guilin 2021-8-3] created.
 *
 */

import { Vector2 } from "babylonjs/Maths/math.vector";
import { StObject } from "../utility/st_object";

/**
 * A vector does NOT have a UUID. It defines algorithms.
 */
export class StVector extends StObject {
    static makeVectorByLength(direct: StVector, len: number): StVector {
        const direct_len = direct.length();
        const x = (direct.x * len) / direct_len;
        const y = (direct.y * len) / direct_len;
        return new StVector(x, y);
    }

    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    clone(): StVector {
        return new StVector(this.x, this.y);
    }

    /**
     * convert to BABYLON Vector2
     * @returns
     *
     * @deprecated DO NOT depend on BABYLON
     */
    toBabylonVector2(): BABYLON.Vector2 {
        return new BABYLON.Vector2(this.x, this.y);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y + this.y);
    }

    angle(): number {
        // Based on: '已知坐标求角度', https://blog.csdn.net/mu399/article/details/81951786
        const [x, y] = [this.x, this.y];
        const l = this.length();
        const a = Math.acos(x / l);
        const ret = (a * 180) / Math.PI; //弧度转角度，方便调试
        if (y < 0) {
            return 360 - ret;
        }
        return ret;
    }

    arch(): number {
        // Based on: '已知坐标求角度', https://blog.csdn.net/mu399/article/details/81951786
        const vec = this;
        const [x, y] = [vec.x, vec.y];
        const l = this.length();
        const a = Math.acos(x / l);
        if (y < 0) {
            return 2 * Math.PI - a;
        }
        return a;
    }

    add(v: StVector): StVector {
        const vec = this.clone();
        vec.x += v.x;
        vec.y += v.y;
        return vec;
    }

    rotate(A: number): StVector {
        const x = this.x;
        const y = this.y;
        return new StVector(x * Math.cos(A) - y * Math.sin(A), x * Math.sin(A) + y * Math.cos(A));
    }

    minus(v: StVector): StVector {
        const vec = this.clone();
        vec.x -= v.x;
        vec.y -= v.y;
        return vec;
    }

    multiple(v: number): StVector {
        const vec = this.clone();
        vec.x *= v;
        vec.y *= v;
        return vec;
    }

    selfAdd(v: StVector): StVector {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    selfMinus(v: StVector): StVector {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    selfMultiple(v: number): StVector {
        this.x *= v;
        this.y *= v;
        return this;
    }
}