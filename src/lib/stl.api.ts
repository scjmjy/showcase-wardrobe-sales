import { Area, AreaHints } from "./model/hint";
import { AnchorMeta, Scope } from "./model/pscope";
import { Cube, Item, Manifest, PartType, Size } from "./scheme";

export interface IStl {
    /**
     * Compute and get the area hint according to a specific manifest and the information of the part which would be
     * put into the scheme defined by the manifest.
     *
     * @param manifest, Manifest object.
     * @param partType, the type of part would affect the area hint behavior.
     * @param partSize, size to check whether the area is available for the part.
     * @return the area hint result.
     */
    computeAreaHints(manifest: Manifest, partType: PartType, partSize: Size): AreaHints;

    /**
     * Compute the available movement scope of a Item.
     *
     * @param cube, the cube which contains this specific Item.
     * @param item, a specific Item.
     * @return the available movement scope.
     */
    computeMovementScope(cube: Cube, item: Item): Scope;

    /**
     * Compute and get the Anchor metadata.
     *
     * @param area, where to place the item.
     * @param item, the item to be placed in the area.
     * @return a default pivot to place the item inside the area and a group of area which can place the item.
     */
    computeAnchorMeta(area: Area, partType: number, partSize: Size): AnchorMeta;
}
