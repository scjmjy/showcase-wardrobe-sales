import { JsonClassType, JsonInclude, JsonIncludeType, JsonProperty } from "jackson-js";
import { Position } from "../scheme";

@JsonInclude({value: JsonIncludeType.NON_NULL})
export class Area {
    @JsonProperty({value: 'cubeId'})
    @JsonClassType({type: () => [String]})
    cubeId: string; // 单元柜uuid
    @JsonProperty({value: 'startPoint'})
    @JsonClassType({type: () => [Position]})
    startPoint: Position; // 开始坐标
    @JsonProperty({value: 'endPoint'})
    @JsonClassType({type: () => [Position]})
    endPoint: Position; // 结束坐标

    constructor(cubeId: string, startPoint: Position, endPoint: Position) {
        this.cubeId = cubeId;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
}

@JsonInclude({value: JsonIncludeType.NON_NULL})
export class CubeAreaHint {
    @JsonProperty({value: 'id'})
    @JsonClassType({type: () => [String]})
    id: string;
    @JsonProperty({value: 'areas'})
    @JsonClassType({type: () => [Array, [Area]]})
    areas: Array<Area>;

    constructor(id: string, areas: Array<Area> = []) {
        this.id = id;
        this.areas = areas;
    }
}

@JsonInclude({value: JsonIncludeType.NON_NULL})
export class AreaHints {
    @JsonProperty({value: 'spaceEnough'})
    @JsonClassType({type: () => [Boolean]})
    spaceEnough: boolean;
    @JsonProperty({value: 'cubeHints'})
    @JsonClassType({type: () => [Array, [CubeAreaHint]]})
    cubeHints: Array<CubeAreaHint>;

    constructor(spaceEnough: boolean = true, cubeHints: Array<CubeAreaHint> = []) {
        this.cubeHints = cubeHints;
        this.spaceEnough = spaceEnough;
    }
}
