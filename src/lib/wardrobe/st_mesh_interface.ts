import { StBoundaryBox, StPoint3, StSketchVector3 } from "../geometry/st_geometric_3d";
import { StTexture } from "../utility/st_texture";
import { StColor } from "../utility/st_color";

export { StIMesh, StIPrefabMesh, StIOnsiteMesh };

/**
 * A mesh object is used for displaying the 3D object in canvas.
 * It DOES NOT Take care of the biz model.
 */
interface StIMesh {
    //position:StPoint3;
    setVisible(v: number): void;
    getVisible(): number;

    rotateY(angle: number): void;
    translate(v: StSketchVector3): void;
    getPosition(): StPoint3;

    deleteMesh(): void;

    /**
     * @todo NOT implemented
     */
    getBoundaryBox(): StBoundaryBox;
}

interface StIOnsiteMesh extends StIMesh {
    setColor(color: StColor): void;
    getColor(): StColor | undefined;
    setTexture(txt: StTexture): void;
    getTexture(): StTexture | undefined;
    createMesh(): void;
}

interface StIPrefabMesh extends StIMesh {
    loadMesh(): void;
}
