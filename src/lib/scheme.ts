export class Position {
    x: number; // 坐标x (毫米)
    y: number; // 坐标y（毫米）
    z: number; // 坐标z（毫米）

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class Size {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class RelativeItem {
    relativeItemId: string; // 相对item的uuid
    relativeType: number; // 1-上面 2-下面 3-里面 4-外面
    relativePosition: Position; // 相对于参考基准面的中心点的位置

    constructor(relativeItemId: string, relativeType: number, relativePosition: Position) {
        this.relativeItemId = relativeItemId;
        this.relativeType = relativeType;
        this.relativePosition = relativePosition;
    }
}

export class Location {
    // 1 - 中间位置（抽屉、隔板、挂衣杆等）
    // 2 - 两侧位置（镜子）
    // 3 - 基于其他item的相对位置
    // 4 - 世界坐标系
    locationType: number;

    // locationType=1或2，Cube坐标系的位置
    // locationType=4，世界坐标系的位置
    startPos: Position | null;

    // locationType=3, 相对于哪个item
    relativeItem: RelativeItem | null;

    constructor(locationType: number, startPos: Position | null, relativeItem: RelativeItem | null) {
        this.locationType = locationType;
        this.startPos = startPos;
        this.relativeItem = relativeItem;
    }
}

export class SchemeObject {
    id: string; // uuid唯一标识
    partId: number; // biz_parts_cm id
    manifest: string; // biz_parts_cm manifest url
    catId: number | null; // category id

    constructor(id: string, partId: number, manifest: string, catId: number | null = null) {
        this.id = id;
        this.partId = partId;
        this.manifest = manifest;
        this.catId = catId;
    }
}

export class Item extends SchemeObject {
    size: Size;
    location: Location; // 描述配件如何放置的

    constructor(id: string, partId: number, manifest: string, catId: number, size: Size, location: Location) {
        super(id, partId, manifest, catId);
        this.size = size;
        this.location = location;
    }
}

export class Cube extends SchemeObject {
    size: Size;
    items: Item[];

    constructor(id: string, partId: number, manifest: string, catId: number, size: Size, items: Item[]) {
        super(id, partId, manifest, catId);
        this.size = size;
        this.items = items;
    }
}

export type DoorLocation = {
    id: string;
    index: number[];
};

export class Door extends SchemeObject {
    size: Size;
    doorType: number; // 1-合页门，2-滑门
    locations: DoorLocation[];

    // TODO: 需要考虑合页门的开合方向吗？
    // 目前，对于单扇合页门，默认往左开

    constructor(
        id: string,
        partId: number,
        manifest: string,
        catId: number,
        size: Size,
        doorType: number,
        locations: DoorLocation[],
    ) {
        super(id, partId, manifest, catId);
        this.size = size;
        this.doorType = doorType;
        this.locations = locations;
    }
}

export class Part {
    partId: number; // biz_parts id
    count: number;

    constructor(partId: number, count: number) {
        this.partId = partId;
        this.count = count;
    }
}

export class Scheme {
    background: SchemeObject[]; // wall(只需要正面墙)，floor
    cubes: Cube[]; // 从左到右排列
    doors: Door[];
    parts: Part[];
    dirty: boolean;

    constructor(background: SchemeObject[], cubes: Cube[], doors: Door[], parts: Part[]) {
        this.background = background;
        this.cubes = cubes;
        this.doors = doors;
        this.parts = parts;
        this.dirty = false;
    }
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

export interface PartType {
    id: number;
    width: number;
    height: number;
    depth: number;
    manifest: string;
    catId: number;
}
