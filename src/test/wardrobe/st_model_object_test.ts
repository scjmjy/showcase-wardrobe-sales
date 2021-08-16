import { StSketchCube, StSketchDivision } from "@/lib/wardrobe/st_sketch_cube";
import { lineLength } from "geometric";

class StSketchCubeTest {
    cube?: StSketchCube;

    create_01(): StSketchCube {
        const cube = new StSketchCube({
            width: 600,
            height: 1200,
            depth: 450,
        });
        console.log(`create cube: ${cube.uuid} `);
        this.cube = cube;
        return cube;
    }

    changeWidth(add: boolean): void {
        if (!this.cube) throw Error("No Cube!");
        const size = this.cube?.getSize();
        const width = size.x + (add ? 100 : -100);
        this.cube.setWidth(width);
        this.cube.updateMesh();
    }

    changeHeight(add: boolean): void {
        if (!this.cube) throw Error("No Cube!");
        const size = this.cube?.getSize();
        const height = size.y + (add ? 200 : -200);
        this.cube.setHeight(height);
        this.cube.updateMesh();
    }

    changeDepth(add: boolean): void {
        if (!this.cube) throw Error("No Cube!");
        const size = this.cube?.getSize();
        const depth = size.z + (add ? 200 : -200);
        this.cube.setDepth(depth);
        this.cube.updateMesh();
    }

    changeBottomGap(add: boolean): void {
        if (!this.cube) throw Error("No Cube!");
        this.cube.gapBottom += add ? 20 : -20;
        this.cube.updateMesh();
    }


    divide_01(): string {
        if (!this.cube) throw Error("No Cube!");
        const div00: StSketchDivision = this.cube._getDivisions()[0];
        const div00_rect = div00._getRect();
        const e0 = div00_rect.edges[0];
        const e2 = div00_rect.edges[2];
        const line = this.cube.addDivideBoard(e0, e2);
        this.cube.updateMesh();
        return `[Success] Divide Line: ${line}`;
    }
}

export const cubeTest = new StSketchCubeTest();
