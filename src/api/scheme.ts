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

export class RelativeItem {
    relativeItemId: string;     // 相对item的uuid
    relativeType: number;       // 1-上面 2-下面 3-里面 4-外面
    relativePosition: Position; // 相对于参考基准面的中心点的位置

    constructor(relativeItemId: string, relativeType: number, relativePosition: Position) {
        this.relativeItemId = relativeItemId;
        this.relativeType = relativeType;
        this.relativePosition = relativePosition;
    }
}

export class Location {
	locationType: number;       // 1 - 世界坐标系
                                // 2 - 中间位置（抽屉、隔板、挂衣杆等）
                                // 3 - 两侧位置（镜子）
                                // 4 - 基于其他item的相对位置
	startPos: Position | null;  // locationType=1，世界坐标系的位置
                                // locationType=2或3，Cube坐标系的位置
    relativeItem: RelativeItem | null; // locationType=4, 相对于哪个item

    constructor(locationType: number, startPos: Position | null, relativeItem: RelativeItem | null) {
        this.locationType = locationType;
        this.startPos = startPos;
        this.relativeItem = relativeItem;
    }
}

export class Item {
	id: string;         // uuid唯一标识
	partId: number;     // biz_parts_cm id
	manifest: string;   // biz_parts_cm manifest url
	location: Location; // 描述配件如何放置的

    constructor(id: string, partId: number, manifest: string, location: Location) {
        this.id = id;
        this.partId = partId;
        this.manifest = manifest;
        this.location = location;
    }
}

export class Cube {
	id: string;         // uuid唯一标识
	partId: number;     // biz_parts_cm id
	manifest: string;   // biz_parts_cm manifest url
	items: Item[];

    constructor(id: string, partId: number, manifest: string, items: Item[]) {
        this.id = id;
        this.partId = partId;
        this.manifest = manifest;
        this.items = items;
    }
}

export class Door {
	id: string;         // uuid唯一标识
	partId: number;     // biz_parts id
	manifest: string;   // biz_parts_cm manifest url
	doorType: number;   // 1-合页门，2-滑门
	cubes: string[];    // 占用单元柜id
	
    // TODO: 需要考虑合页门的开合方向吗？
    // 目前，对于单扇合页门，默认往左开

    constructor(id: string, partId: number, manifest: string, doorType: number, cubes: string[]) {
        this.id = id;
        this.partId = partId;
        this.manifest = manifest;
        this.doorType = doorType;
        this.cubes = cubes;
    }
}

export class Scheme {
    background: Item[]; // wall(只需要正面墙)，floor
    cubes: Cube[];  // 从左到右排列
    doors: Door[];

    constructor(background: Item[], cubes: Cube[], doors: Door[]) {
        this.background = background;
        this.cubes = cubes;
        this.doors = doors;
    }
}

export class Area {
    cubeId: string;         // 单元柜uuid
    startPoint: Position;   // 开始坐标
    endPoint: Position;     // 结束坐标

    constructor(cubeId: string, startPoint: Position, endPoint: Position) {
        this.cubeId = cubeId;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
}

export class Hint {
    id: string;        //uuid
    message: string;   //message

    constructor(id: string, message: string) {
        this.id = id;
        this.message = message;
    }
}