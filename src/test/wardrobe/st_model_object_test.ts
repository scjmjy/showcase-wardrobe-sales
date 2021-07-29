import { StSketchCube } from "@/lib/wardrobe/st_sketch_cube";

export class StSketchCubeTest {
    cube? : StSketchCube ;

    create_01(): StSketchCube {
        const cube = new StSketchCube({
            parent: null,
            width: 600,
            height: 1200,
            depth: 550,
        });
        console.log(`create cube: ${cube.uuid} `);
        this.cube = cube;
        return cube;
    }
    
    changeWidth(add: boolean): void {
        if(!this.cube) throw Error("No Cube!");
        const size = this.cube?.getSize();
        const width = size.x + (add ? 200 : -200);
        this.cube.setWidth(width);
        this.cube.updateMesh();
    }
    
}

const cubeTest = new StSketchCubeTest();