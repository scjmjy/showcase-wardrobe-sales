import { StSketchLine } from "@/lib/geometry/st_geometric_2d";
import { StSketchCube, StSketchDivision } from "@/lib/wardrobe/st_sketch_cube";

class StSketchCubeTest {
    cube?: StSketchCube;

    create_01(): StSketchCube {
        const cube = new StSketchCube({
            width: 1200,
            height: 1800,
            depth: 550,
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
        const board = this.cube.addDivideBoard(e0, e2);

        const e1 = div00_rect.edges[1];
        const e3 = div00_rect.edges[3];
        const board2 = this.cube.addDivideBoard(e1, e3);

        this.cube.updateMesh();
        return `[Success] Divide Boards(Lines): \n\t ${board} \n\t ${board2}`;
    }

    divide_02(): string {
        if (!this.cube) throw Error("No Cube!");
        const line0 = StSketchLine.buildByArray([[0, 1500], [1200, 1500]]);
        const line1 = StSketchLine.buildByArray([[800, 0],  [800,  1500]]);
    
        const b0 = this.cube.addDivideBoardByLine(line0);
        const b1 = this.cube.addDivideBoardByLine(line1);

        this.cube.updateMesh();
        return `[Success] Divide Boards(Lines): \n\t ${b0} \n\t ${b1}`;
    }
}

export const cubeTest = new StSketchCubeTest();
