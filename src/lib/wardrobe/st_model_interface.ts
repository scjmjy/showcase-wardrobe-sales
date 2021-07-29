import { StSketchRect } from "../geometry/st_geometric_2d";
import { StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StPulloutType } from "../utility/st_sketch_type";
import { StColor } from "../utility/st_color";

export { StIModel, StIAccesory, StIMovable, StIPullout, StIDivison, StILevel, StICube };

/**
 * Interface: Biz Model Object, e.g. a wardrobe, a cube, a division.
 */
interface StIModel {
    readonly uuid: string;
    setParent(parent: StIModel): void;
    getParent(): StIModel | null;

    /**
     * position in its parent model
     */
    getPosition(): StPoint3;
    translate(v: StSketchVector3): void;

    /**
     * rotate model in its parent SPACE
     * @param angle
     */
    rotateY(angle: number): void;

    addChild(child: StIModel): void;
    deleteChild(child_uuid: string): StIModel | null;
    getChild(uuid: string): StIModel | null;
    getChilden(uuid: string): StIModel[];

    /**
     * Changing size (w/h/d) causes the 3D mesh in BABYLON updated.
     * @param w
     */
    setWidth(w: number): void;
    setHeight(h: number): void;
    setDepth(d: number): void;
    getSize(): StSketchVector3;

    updateMesh(): void;
}

interface StIAccesory extends StIModel {
    /**
     * Get the occupied retangle in its parent in the X-o-Y plane.
     */
    getOccupyRect(): StSketchRect;

    /**
     * Check if current accesory overlaps with another in the same parent model(division)
     * @param acce
     */
    overlapWith(acce: StIAccesory): boolean;
}

interface StIMovable extends StIAccesory {
    /**
     * get the accesory, which this movable sits on.
     */
    getBase(): StIAccesory;
}

interface StIPullout extends StIAccesory {
    /**
     * @param out_value (0 - 1)
     */
    pullout(out_value: number): void;

    readonly pulloutType: StPulloutType;
}

/**
 * A division has a rectangle on the XOY plane.
 *
 * Usually, the location of the this rectangle is in the cube's SPACE.
 *
 */
interface StIDivison extends StIModel {
    calculateAvailable(acce_info: StIAccesory): StSketchRect[];

    addAccesory(acce: StIAccesory): void;

    moveAccesory(acce_id: string, vec: StSketchVector3): void;

    deleteAccesory(acce_id: string): void;
}

/**
 * a level a made of 1-n division.
 */
interface StILevel extends StIModel {
    /**
     * If a divide is moved, its left divison width changes, while the right one moves its position
     * @param idx  start from 1 to 'divisions.length()-1'
     * @param step
     */
    moveDivide(idx: number, step: number): number;

    divideDivision(div_id: string): string;

    deleteDivision(div_id: string): void;

    getHeight(): number;

    // setHeight(h: number): void;
}

interface StICube extends StIModel {
    createLevel(offset_y: number): void;

    setLevelOffset(level_id: string, offset_y: number): void;

    deleteLevel(level_id: string): void;

    deleteDivision(div_id: string): void;

    changeTexture(txt_id: string): void;

    changeColor(color: StColor): void;

    calculateAvailable(acce: StIAccesory): StSketchRect[];
}
