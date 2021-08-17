import { Scheme, Cube, Item, Part } from "@/lib/scheme";

type CubeData = {
    origin: { x: number; y: number; z: number }; // center-down, in mm.
    width: number;
    height: number;
    depth: number;
};

export class BizData {
    private scheme: Scheme;

    // translate mm to inch: 0.001 * 39.3700787
    public SceneUnit = 1; // 0.0393700787;

    public totalWidth = 0;
    public totalHeight = 0;
    public totalDepth = 0;
    public cubeMap: Map<string, CubeData>;
    public partManifestMap: Map<string, string>;

    constructor(scheme: Scheme) {
        this.scheme = scheme;
        this.cubeMap = new Map<string, CubeData>();
        this.partManifestMap = new Map<string, string>();

        // TODO: get the map of partId & manifest from backend.
        this.partManifestMap.set("200001", "mf/90da222b-d5c4-40e9-a693-8fe0b2b3ff78.json");
        this.partManifestMap.set("300001", "mf/f5b3357e-6c76-476e-a97b-2a5612277e8e.json");
        this.partManifestMap.set("300002", "mf/ba27f19e-2131-4fe4-9b8c-e1edca652393.json");
        this.partManifestMap.set("300003", "mf/f5851579-ce40-4085-b3aa-47fbe3dcdb10.json");
        this.partManifestMap.set("300004", "mf/51c67403-1823-42ab-8cc5-7325355c7a55.json");
        this.partManifestMap.set("300005", "mf/7d6ea7d9-c01c-481d-9b3a-f7c1e743a7b7.json");
        this.partManifestMap.set("400001", "mf/bbf7f299-7ae8-4977-a26e-5e09b761a8fe.json");
    }

    AddItem(newItem: Item, cubeId: string): void {
        const cube = this.FindCubeById(cubeId);
        if (cube !== undefined) {
            cube.items.push(newItem);
        }

        const part = this.FindPartById(newItem.partId);
        if (part !== undefined) {
            part.count += 1;
        } else {
            const newPart = new Part(newItem.partId, 1);
            this.scheme.parts.push(newPart);
        }
    }

    FindCubeById(id: string): Cube | undefined {
        return this.scheme.cubes.find((cube: { id: string }) => cube.id === id);
    }

    FindPartById(id: number): Part | undefined {
        return this.scheme.parts.find((part: { partId: number }) => part.partId === id);
    }
}
