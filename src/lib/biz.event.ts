import { Cube, Item, Door, Location } from "@/lib/scheme";

export enum EventType {
    OBJECT_SELECTED,
    OBJECT_UNSELECTED,
    CUBE_ADDED,
    CUBE_REMOVED,
    CUBE_CHANGED,
    ITEM_ADDED,
    ITEMS_REMOVED,
    ITEM_CHANGED,
    ITEM_MOVED,
    DOOR_ADDED,
    DOORS_REMOVED,
    DOOR_CHANGED,
    SCHEME_LOADCOMPLETED,
}

export class Event {
    readonly type: EventType;

    constructor(type: EventType) {
        this.type = type;
    }
}

/**
 * 选择3D对象
 * 备注：Web需要更新卡片选择池
 */
export class ObjectSelectedEvent extends Event {
    readonly category: string;
    readonly partId: number;
    readonly object: Cube | Item | Door;

    constructor(category: string, partId: number, object: Cube | Item | Door) {
        super(EventType.OBJECT_SELECTED);

        this.category = category;
        this.partId = partId;
        this.object = object;
    }
}

/**
 * 取消选择3D对象
 * 备注：Web需要更新卡片选择池
 */
export class ObjectUnselectedEvent extends Event {
    readonly category: string;
    readonly partId: number;
    readonly object: Cube | Item | Door;

    constructor(category: string, partId: number, object: Cube | Item | Door) {
        super(EventType.OBJECT_UNSELECTED);

        this.category = category;
        this.partId = partId;
        this.object = object;
    }
}

/**
 * 增加一个单元柜
 * @param cube 3D生成cubeId
 * @param index 从左到右的索引（0开头）
 */
export class CubeAddedEvent extends Event {
    readonly cube: Cube;
    readonly index: number;

    constructor(cube: Cube, index: number) {
        super(EventType.CUBE_ADDED);

        this.cube = cube;
        this.index = index;
    }
}

/**
 * 移除单元柜
 * 备注：需要移除配件和占用的合页门或滑门，需要二次确认？
 * @param cube
 */
export class CubeRemovedEvent extends Event {
    readonly cube: Cube;

    constructor(cube: Cube) {
        super(EventType.CUBE_REMOVED);

        this.cube = cube;
    }
}

/**
 * 修改单元柜的的材质或颜色
 */
export class CubeChangedEvent extends Event {
    readonly oldCube: Cube;
    readonly newCube: Cube;

    constructor(oldCube: Cube, newCube: Cube) {
        super(EventType.CUBE_CHANGED);

        this.oldCube = oldCube;
        this.newCube = newCube;
    }
}

/**
 * 增加一个item
 */
export class ItemAddedEvent extends Event {
    readonly item: Item;

    constructor(item: Item) {
        super(EventType.ITEM_ADDED);

        this.item = item;
    }
}

/**
 * 一个或者多个item被移除
 */
export class ItemsRemovedEvent extends Event {
    readonly items: Item[];

    constructor(items: Item[]) {
        super(EventType.ITEMS_REMOVED);

        this.items = items;
    }
}

/**
 * item的材质或颜色被修改
 */
export class ItemChangedEvent extends Event {
    readonly oldItem: Item;
    readonly newItem: Item;

    constructor(oldItem: Item, newItem: Item) {
        super(EventType.ITEM_CHANGED);

        this.oldItem = oldItem;
        this.newItem = newItem;
    }
}

/**
 * 移动item到新位置
 */
export class ItemMovedEvent extends Event {
    readonly item: Item;
    readonly oldCubeId: string;
    readonly oldLocation: Location;
    readonly newCubeId: string;
    readonly newLocation: Location;

    constructor(item: Item, oldCubeId: string, oldLocation: Location, newCubeId: string, newLocation: Location) {
        super(EventType.ITEM_MOVED);

        this.item = item;
        this.oldCubeId = oldCubeId;
        this.oldLocation = oldLocation;
        this.newCubeId = newCubeId;
        this.newLocation = newLocation;
    }
}

/**
 * 增加一扇门
 */
export class DoorAddedEvent extends Event {
    readonly door: Door;

    constructor(door: Door) {
        super(EventType.DOOR_ADDED);

        this.door = door;
    }
}

/**
 * 一扇或者多扇门被移除
 */
export class DoorsRemovedEvent extends Event {
    type = EventType.DOORS_REMOVED;
    readonly doors: Door[];

    constructor(doors: Door[]) {
        super(EventType.DOORS_REMOVED);

        this.doors = doors;
    }
}

/**
 * door的材质或颜色被修改
 */
export class DoorChangedEvent extends Event {
    type = EventType.DOOR_CHANGED;
    readonly oldDoor: Door;
    readonly newDoor: Door;

    constructor(oldDoor: Door, newDoor: Door) {
        super(EventType.DOOR_CHANGED);

        this.oldDoor = oldDoor;
        this.newDoor = newDoor;
    }
}

/**
 * scheme加载完成
 */
export class SchemeLoadCompletedEvent extends Event {
    constructor() {
        super(EventType.SCHEME_LOADCOMPLETED);
    }
}
