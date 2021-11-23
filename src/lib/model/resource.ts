import { JsonClassType, JsonInclude, JsonIncludeType, JsonProperty } from "jackson-js";

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Resource {
    @JsonProperty({ value: "name" })
    @JsonClassType({ type: () => [String] })
    name: string;

    @JsonProperty({ value: "url" })
    @JsonClassType({ type: () => [String] })
    url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}
