type CubeData = {
    origin: { x: number; y: number; z: number }; // center-down, in mm.
    width: number;
    height: number;
    depth: number;
};

export class BizData {
    private scheme: any;

    public totalWidth = 0;
    public totalHeight = 0;
    public totalDepth = 0;
    public cubeData: Map<string, CubeData>;

    constructor(scheme: any) {
        this.scheme = scheme;
        this.cubeData = new Map<string, CubeData>();
    }
}
