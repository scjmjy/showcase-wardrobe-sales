/**
 * @file    st_object.ts
 * @author  Guilin
 *
 * @description Ancestor class
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-11] Created in st_sketch_type.ts
 * [Guilin 2021-07-27] Move into its own file.
 * [Guilin 2021-08-12] Use json-stringify-pretty-compact
 *
 */

import { jsonIgnoreReplacer } from "json-ignore";
import stringify from "json-stringify-pretty-compact";
import { v4 as uuidv4 } from "uuid";

export class StObject {
    /**
     * It seeams that `${variable}` call variable.toString()?
     */
    toString(max_len?: number, simple?: boolean): string {
        //return JSON.stringify(this, jsonIgnoreReplacer);
        if (simple) {
            return JSON.stringify(this, jsonIgnoreReplacer);
        } else {
            return stringify(this, {
                maxLength: max_len || 256,
                replacer: jsonIgnoreReplacer,
            });
        }
    }

    assertTrue(v: boolean, msg?: string) {
        if (!v) {
            throw Error(msg ? `Error: ${msg}` : "Error: Assert Failure!");
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

    toFixed(value: number, digits?: number): number {
        if(!digits) {
            digits = 2;
        }
        const A = Math.pow(10, digits);
        const V = value * A;
        return Math.round(V) / A;
    }        
}

export const sketchUtil = new StSketchUtil();
