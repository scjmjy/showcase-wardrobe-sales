import { PartAttachment } from "@/api/interface/provider.interface";
import { JsonClassType, JsonInclude, JsonIncludeType, JsonProperty } from "jackson-js";

export enum PartType {
    UNKNOWN = 0,
    GENERAL = 1,
    T_FRAME = 2,
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Position {
    @JsonProperty({ value: "x" })
    @JsonClassType({ type: () => [Number] })
    x: number;
    @JsonProperty({ value: "y" })
    @JsonClassType({ type: () => [Number] })
    y: number;
    @JsonProperty({ value: "z" })
    @JsonClassType({ type: () => [Number] })
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Size {
    @JsonProperty({ value: "x" })
    @JsonClassType({ type: () => [Number] })
    x: number;
    @JsonProperty({ value: "y" })
    @JsonClassType({ type: () => [Number] })
    y: number;
    @JsonProperty({ value: "z" })
    @JsonClassType({ type: () => [Number] })
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class RelativeItem {
    @JsonProperty({ value: "relativeItemId" })
    @JsonClassType({ type: () => [String] })
    relativeItemId: string; // 相对item的uuid
    @JsonProperty({ value: "relativeType" })
    @JsonClassType({ type: () => [Number] })
    relativeType: number; // 1-上面 2-下面 3-里面 4-外面
    @JsonProperty({ value: "relativePosition" })
    @JsonClassType({ type: () => [Position] })
    relativePosition: Position; // 相对于参考基准面的中心点的位置

    constructor(relativeItemId: string, relativeType: number, relativePosition: Position) {
        this.relativeItemId = relativeItemId;
        this.relativeType = relativeType;
        this.relativePosition = relativePosition;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Location {
    static DEFAULT_LOCATION = new Location(1, new Position(0, 0, 0), null);

    // 1 - 中间位置（抽屉、隔板、挂衣杆等）
    // 2 - 两侧位置（镜子）
    // 3 - 基于其他item的相对位置
    // 4 - 世界坐标系
    @JsonProperty({ value: "locationType" })
    @JsonClassType({ type: () => [Number] })
    locationType: number;

    // locationType=1或2，Cube坐标系的位置
    // locationType=4，世界坐标系的位置

    @JsonProperty({ value: "startPos" })
    @JsonClassType({ type: () => [Position] })
    startPos: Position;

    // locationType=3, 相对于哪个item
    @JsonProperty({ value: "relativeItem" })
    @JsonClassType({ type: () => [RelativeItem] })
    relativeItem: RelativeItem | null;

    constructor(locationType: number, startPos: Position, relativeItem: RelativeItem | null) {
        this.locationType = locationType;
        this.startPos = startPos;
        this.relativeItem = relativeItem;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class SchemeObject {
    @JsonProperty({ value: "id" })
    @JsonClassType({ type: () => [String] })
    id: string; // uuid唯一标识
    @JsonProperty({ value: "partId" })
    @JsonClassType({ type: () => [Number] })
    partId: number; // biz_parts_cm id
    @JsonProperty({ value: "manifest" })
    @JsonClassType({ type: () => [String] })
    manifest: string; // biz_parts_cm manifest url
    @JsonProperty({ value: "catId" })
    @JsonClassType({ type: () => [Number] })
    catId: number | null; // category id

    constructor(id: string, partId: number, manifest: string, catId: number | null = null) {
        this.id = id;
        this.partId = partId;
        this.manifest = manifest;
        this.catId = catId;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Item extends SchemeObject {
    @JsonProperty({ value: "size" })
    @JsonClassType({ type: () => [Size] })
    size: Size;
    @JsonProperty({ value: "attachment" })
    @JsonClassType({ type: () => [Array, [PartCount]] })
    attachment: Array<PartCount>;
    @JsonProperty({ value: "location" })
    @JsonClassType({ type: () => [Location] })
    location: Location; // 描述配件如何放置的
    @JsonProperty({ value: "partType" })
    @JsonClassType({ type: () => [Number] })
    partType: PartType;

    constructor(
        id: string,
        partId: number,
        manifest: string,
        catId: number,
        size: Size,
        attachment: Array<PartCount>,
        location: Location = Location.DEFAULT_LOCATION,
        partType: PartType = PartType.GENERAL,
    ) {
        super(id, partId, manifest, catId);
        this.size = size;
        this.attachment = attachment;
        this.location = location;
        this.partType = partType;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Cube extends SchemeObject {
    @JsonProperty({ value: "size" })
    @JsonClassType({ type: () => [Size] })
    size: Size;
    @JsonProperty({ value: "items" })
    @JsonClassType({ type: () => [Array, [Item]] })
    items: Array<Item>;

    constructor(id: string, partId: number, manifest: string, catId: number, size: Size, items: Array<Item> = []) {
        super(id, partId, manifest, catId);
        this.size = size;
        this.items = items;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class DoorLocation {
    @JsonProperty({ value: "id" })
    @JsonClassType({ type: () => [String] })
    id: string;
    @JsonProperty({ value: "index" })
    @JsonClassType({ type: () => [Array, [Number]] })
    index: Array<number>;

    constructor(id: string, index: Array<number> = []) {
        this.id = id;
        this.index = index;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Door extends SchemeObject {
    @JsonProperty({ value: "size" })
    @JsonClassType({ type: () => [Size] })
    size: Size;
    @JsonProperty({ value: "attachment" })
    @JsonClassType({ type: () => [Array, [PartCount]] })
    attachment: Array<PartCount>;
    @JsonProperty({ value: "doorType" })
    @JsonClassType({ type: () => [Number] })
    doorType: number; // 1-合页门，2-滑门
    @JsonProperty({ value: "locations" })
    @JsonClassType({ type: () => [Array, [DoorLocation]] })
    locations: Array<DoorLocation>;

    // TODO: 需要考虑合页门的开合方向吗？
    // 目前，对于单扇合页门，默认往左开

    constructor(
        id: string,
        partId: number,
        manifest: string,
        catId: number,
        size: Size,
        attachment: Array<PartCount>,
        doorType: number,
        locations: Array<DoorLocation> = [],
    ) {
        super(id, partId, manifest, catId);
        this.size = size;
        this.attachment = attachment;
        this.doorType = doorType;
        this.locations = locations;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Manifest {
    @JsonProperty({ value: "background" })
    @JsonClassType({ type: () => [Array, [SchemeObject]] })
    background: Array<SchemeObject>; // wall(只需要正面墙)，floor
    @JsonProperty({ value: "cubes" })
    @JsonClassType({ type: () => [Array, [Cube]] })
    cubes: Array<Cube>; // 从左到右排列
    @JsonProperty({ value: "doors" })
    @JsonClassType({ type: () => [Array, [Door]] })
    doors: Array<Door>;

    constructor(background: Array<SchemeObject> = [], cubes: Array<Cube> = [], doors: Array<Door> = []) {
        this.background = background;
        this.cubes = cubes;
        this.doors = doors;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class PartCount {
    @JsonProperty({ value: "partId" })
    @JsonClassType({ type: () => [Number] })
    partId: number;

    @JsonProperty({ value: "count" })
    @JsonClassType({ type: () => [Number] })
    count: number;

    constructor(partId: number, count: number) {
        this.partId = partId;
        this.count = count;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Scheme {
    @JsonProperty({ value: "config" })
    @JsonClassType({ type: () => [Config] })
    config: Config;

    @JsonProperty({ value: "manifest" })
    @JsonClassType({ type: () => [Manifest] })
    manifest: Manifest;

    dirty: boolean;

    constructor(config: Config, manifest: Manifest) {
        this.config = config;
        this.manifest = manifest;
        this.dirty = false;
    }

    private addPart(parts: Array<PartCount>, partId: number, count: number): void {
        const part = parts.find((part: { partId: number }) => part.partId === partId);
        if (part !== undefined) {
            part.count += count;
        } else {
            const newPart = new PartCount(partId, count);
            parts.push(newPart);
        }
    }

    getPartCounts(): Array<PartCount> {
        const parts: Array<PartCount> = [];

        // Add cube, item partCount.
        this.manifest.cubes.forEach((cube) => {
            this.addPart(parts, cube.partId, 1);
            cube.items.forEach((item) => {
                this.addPart(parts, item.partId, 1);
            });
        });

        // add door partCount.
        this.manifest.doors.forEach((door) => {
            let doorNum = 0;
            for (let i = 0; i < door.locations.length; i++) {
                doorNum += door.locations[i].index.length;
            }
            this.addPart(parts, door.partId, doorNum);
        });

        // add attachment partCount.
        this.manifest.cubes.forEach((cube) => {
            cube.items.forEach((item) => {
                item.attachment.forEach((attachment) => {
                    this.addPart(parts, attachment.partId, attachment.count);
                });
            });
        });

        this.manifest.doors.forEach((door) => {
            door.attachment.forEach((attachment) => {
                this.addPart(parts, attachment.partId, attachment.count);
            });
        });

        return parts;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class SizeConfig {
    @JsonProperty({ value: "cube_thick_top" })
    @JsonClassType({ type: () => [Number] })
    cube_thick_top: number;

    @JsonProperty({ value: "cube_thick_bottom" })
    @JsonClassType({ type: () => [Number] })
    cube_thick_bottom: number;

    @JsonProperty({ value: "cube_thick_left" })
    @JsonClassType({ type: () => [Number] })
    cube_thick_left: number;

    @JsonProperty({ value: "cube_thick_right" })
    @JsonClassType({ type: () => [Number] })
    cube_thick_right: number;

    @JsonProperty({ value: "cube_thick_back" })
    @JsonClassType({ type: () => [Number] })
    cube_thick_back: number;

    constructor(
        cube_thick_top = 0,
        cube_thick_bottom = 0,
        cube_thick_left = 0,
        cube_thick_right = 0,
        cube_thick_back = 0,
    ) {
        this.cube_thick_top = cube_thick_top;
        this.cube_thick_bottom = cube_thick_bottom;
        this.cube_thick_left = cube_thick_left;
        this.cube_thick_right = cube_thick_right;
        this.cube_thick_back = cube_thick_back;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class StandardCube {
    @JsonProperty({ value: "partId" })
    @JsonClassType({ type: () => [Number] })
    partId: number;
    @JsonProperty({ value: "manifest" })
    @JsonClassType({ type: () => [String] })
    manifest: string;
    @JsonProperty({ value: "catId" })
    @JsonClassType({ type: () => [Number] })
    catId: number;
    @JsonProperty({ value: "size" })
    @JsonClassType({ type: () => [Size] })
    size: Size;

    constructor(partId: number, manifest: string, catId: number, size: Size) {
        this.partId = partId;
        this.manifest = manifest;
        this.catId = catId;
        this.size = size;
    }
}

@JsonInclude({ value: JsonIncludeType.NON_NULL })
export class Config {
    @JsonProperty({ value: "sizeConfig" })
    @JsonClassType({ type: () => [SizeConfig] })
    sizeConfig: SizeConfig;

    @JsonProperty({ value: "standardCube" })
    @JsonClassType({ type: () => [StandardCube] })
    standardCube: StandardCube;

    constructor(sizeConfig: SizeConfig, standardCube: StandardCube) {
        this.sizeConfig = sizeConfig;
        this.standardCube = standardCube;
    }
}

export interface Part {
    id: number;
    width: number;
    height: number;
    depth: number;
    manifest: string;
    catId: number;
    attachments: PartAttachment[];
}

export class Area {
    cubeId: string; // 单元柜uuid
    startPoint: Position; // 开始坐标
    endPoint: Position; // 结束坐标

    constructor(cubeId: string, startPoint: Position, endPoint: Position) {
        this.cubeId = cubeId;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
}

export class Hint {
    id: string; //uuid
    message: string; //message

    constructor(id: string, message: string) {
        this.id = id;
        this.message = message;
    }
}
