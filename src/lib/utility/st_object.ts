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


export class StObject {
	toString(): string {
		return JSON.stringify(this);
	}
}

