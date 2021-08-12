/**
 * @file    st_object.ts
 * @author  Guilin
 *
 * @description Ancestor class
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-11] Created in st_sketch_type.ts
 * [Guilin 2021-07-27] Move into its own file.
 *
 */

import { v4 as uuidv4 } from "uuid";

export class StObject {
    toString(): string {
        return JSON.stringify(this);
    }

    assertTrue(v: boolean, msg?:string){
        if(!v) {
            throw Error(msg ?  `Error: ${msg}`: "Error: Assert Failure!");
        }
    }
}

export class StUuidObject extends StObject {
    readonly uuid = uuidv4();
}

class StSketchUtil {
    assert(condition: boolean, msg?: string) {
        if (!condition) {
            throw Error(msg);
        }
    }
}

export const sketchUtil = new StSketchUtil();
