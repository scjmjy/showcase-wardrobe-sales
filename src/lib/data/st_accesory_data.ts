import { StCubePart, StPulloutType } from "../utility/st_sketch_type";
import { StColor } from "../utility/st_color";

/**
 * Describe a cube accesory.
 * This is a record of cube accesory saved in DB
 */
export interface StIAccesoryData {
    partType: StCubePart;
    pid: number;
    mid: string;
    width: number;
    height: number;
    depth: number;

    rootUrl: string;
    filename: string;
    localKey?: string;
    color?: StColor;
    texture?: string; // file name in texture folder
}

/**
 * Describe a cube pullout object, used to create a babylon mesh.
 */
export interface StIPulloutInfo extends StIAccesoryData {
    name: string;
    cubeName: string;
    pulloutType: StPulloutType;
}
