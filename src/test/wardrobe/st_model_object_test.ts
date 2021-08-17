import { StSketchCube, StSketchDivision } from "@/lib/wardrobe/st_sketch_cube";

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
        this.cube.updateMesh();
        return cube;
    }

    changeWidth(add: boolean): string {
        if (!this.cube) throw Error("No Cube!");
        const size = this.cube?.getSize();
        const width = size.x + (add ? 100 : -100);
        this.cube.setWidth(width);
        this.cube.updateMesh();
        return `[Success] change width: ${this.cube.getWidth()}`;
    }

    changeHeight(add: boolean): string {
        if (!this.cube) throw Error("No Cube!");
        const size = this.cube?.getSize();
        const height = size.y + (add ? 200 : -200);
        this.cube.setHeight(height);
        this.cube.updateMesh();
        return `[Success] change height: ${this.cube.getHeight()}`;
    }

    changeDepth(add: boolean): string {
        if (!this.cube) throw Error("No Cube!");
        const size = this.cube?.getSize();
        const depth = size.z + (add ? 200 : -200);
        this.cube.setDepth(depth);
        this.cube.updateMesh();
        return `[Success] change depth: ${this.cube.getDepth()}`;
    }

    changeBottomGap(add: boolean): string {
        if (!this.cube) throw Error("No Cube!");
        this.cube.gapBottom += add ? 20 : -20;
        this.cube.updateMesh();
        return `[Success] change bottom gap: ${this.cube.gapBottom} `
    }


    divide_01(): string {
        if (!this.cube) throw Error("No Cube!");
        const div00: StSketchDivision = this.cube.__getDivisions()[0];
        const div00_rect = div00.__getRect();
        const e0 = div00_rect.edges[0];
        const e2 = div00_rect.edges[2];
        const line = this.cube.addDivideBoard(e0, e2);

        const e1 = div00_rect.edges[1];
        const e3 = div00_rect.edges[3];
        const line2 = this.cube.addDivideBoard(e1, e3);

        this.cube.updateMesh();
        return `[Success] Divide Lines: \n\t ${line} \n\t ${line2}`;
    }
}

export const cubeTest = new StSketchCubeTest();
