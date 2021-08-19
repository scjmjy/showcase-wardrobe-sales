import { Scheme, Cube, Item, Part } from "@/lib/scheme";

export type CubeData = {
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
        this.partManifestMap.set("100001", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/69771f55-f709-4f9b-96b6-0af6eafc4a26.jpg");
        this.partManifestMap.set("100002", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/d8282dee-13f2-4884-99c0-5d56962d95ac.jpg");
        this.partManifestMap.set("100003", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/d6733d2b-a73f-449f-aec9-4da25a980e30.jpg");
        this.partManifestMap.set("100004", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/d6505e88-aa64-4ce8-adae-2b62796d9397.jpg");

        this.partManifestMap.set("110001", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/00ac1404-b1c5-4a88-bc5c-2fe1480d9e30.jpg");
        this.partManifestMap.set("110002", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/97b67520-88f8-4b92-ae9a-e39c4e641215.jpg");
        this.partManifestMap.set("110003", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/cc720923-b9d4-4ad1-af1e-db98151cacec.jpg");
        this.partManifestMap.set("110004", "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/dc5eb19b-2879-47fe-a517-720b39e0f445.jpg");

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

    FindCubeDataById(id: string) : CubeData | undefined {
        const data = this.cubeMap.get(id);
        return data;
    }

    FindCubeItems(id: string): Item[] | null {
        let cube: Cube | null = null ;
        for(const c of this.scheme.cubes) {
            if(c.id == id) {
                cube = c;
                break;
            }
        }
        if(!cube) return null;
        return cube.items;
    }
}
