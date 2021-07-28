/**
 * @file    st_color.ts
 * @author  Guilin
 * 
 * @description A simple color wrapper
 * 
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-7-21] Created. 
 * 
 */
import { StObject } from "./st_object";

/**
 * r/g/b: 0-255
 * alpha: 0-1
 */
export class StColor extends StObject {
	readonly r: number;
	readonly g: number;
	readonly b: number;
	readonly alpha?: number;

	constructor(r: number, g: number, b: number, alpha?: number) {
		super();
		this.r = r;
		this.g = g;
		this.b = b;
		this.alpha = alpha;
	}
}
