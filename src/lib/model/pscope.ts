import { JsonClassType, JsonInclude, JsonIncludeType, JsonProperty } from "jackson-js";
import { Vector3 } from "../scheme";

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Interval {
    @JsonProperty({ value: "min" })
    @JsonClassType({ type: () => [Number] })
    min: number;
    @JsonProperty({ value: "max" })
    @JsonClassType({ type: () => [Number] })
    max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Scope {
    @JsonProperty({ value: "intervalsX" })
    @JsonClassType({ type: () => [Array, [Interval]] })
    intervalsX: Array<Interval>;
    @JsonProperty({ value: "intervalsY" })
    @JsonClassType({ type: () => [Array, [Interval]] })
    intervalsY: Array<Interval>;
    @JsonProperty({ value: "intervalsZ" })
    @JsonClassType({ type: () => [Array, [Interval]] })
    intervalsZ: Array<Interval>;

    constructor(intervalsX: Array<Interval>, intervalsY: Array<Interval>, intervalsZ: Array<Interval>) {
        this.intervalsX = intervalsX;
        this.intervalsY = intervalsY;
        this.intervalsZ = intervalsZ;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class AnchorMeta {
    @JsonProperty({ value: "pivot" })
    @JsonClassType({ type: () => [Vector3] })
    pivot: Vector3;
    @JsonProperty({ value: "scope" })
    @JsonClassType({ type: () => [Scope] })
    scope: Scope;

    constructor(pivot: Vector3, scope: Scope) {
        this.pivot = pivot;
        this.scope = scope;
    }
}
