import { StSketchCube } from "@/lib/wardrobe/st_sketch_cube";

export class StSketchCubeTest {
    create_01(): void {
        const cube = new StSketchCube({
            parent: null,
            width: 600,
            height: 1200,
            depth: 550,
        });
        console.log(`create cube: ${cube.uuid} `);
    }
}
