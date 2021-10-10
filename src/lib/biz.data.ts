import { Scheme, Cube, Item, Door, PartCount, Part, Size, DoorLocation } from "@/lib/scheme";
import { v4 as uuidv4 } from "uuid";

export const ObjectType = {
    CUBE: "Cube",
    ITEM: "Item",
    DOOR: "Door",
};

export type CubeData = {
    origin: { x: number; y: number; z: number }; // center-down, in meter.
    width: number;
    height: number;
    depth: number;
};

export type CubeItem = {
    cube: Cube | undefined;
    item: Item | undefined;
};

export class BizData {
    private scheme: Scheme;

    // the default unit is 1 meter.
    public SceneUnit = 1;

    public startX = 0;
    public endX = 0;
    public totalWidth = 0;
    public totalHeight = 0;
    public totalDepth = 0;
    public cubeMap: Map<string, CubeData>;

    constructor(scheme: Scheme) {
        this.scheme = scheme;
        this.cubeMap = new Map<string, CubeData>();
    }

    addCube(newCube: Cube, addToLeft = false): void {
        if (addToLeft) {
            this.startX += newCube.size.x;
            this.scheme.manifest.cubes.unshift(newCube);
        } else {
            this.endX -= newCube.size.x;
            this.scheme.manifest.cubes.push(newCube);
        }
        this.totalWidth += newCube.size.x;
        if (newCube.size.y > this.totalHeight) this.totalHeight = newCube.size.y;
        if (newCube.size.z > this.totalDepth) this.totalDepth = newCube.size.z;

        this.scheme.dirty = true;
    }

    removeCube(cubeId: string): void {
        const idx = this.scheme.manifest.cubes.findIndex((cube: { id: string }) => cube.id === cubeId);
        const cube = this.scheme.manifest.cubes[idx];

        if (idx === 0) {
            // Remove the first cube.
            this.startX -= cube.size.x;
        } else if (idx == this.scheme.manifest.cubes.length - 1) {
            // Remove the last cube.
            this.endX += cube.size.x;
        }
        this.totalWidth -= cube.size.x;
        // TODO: handle the case of the different cube height and depth.

        this.scheme.manifest.cubes.splice(idx, 1);
        this.cubeMap.delete(cubeId);

        this.scheme.dirty = true;
    }

    changeCube(cubeId: string, newPart: Part): void {
        const cube = this.findCubeById(cubeId);
        if (cube !== undefined) {
            cube.partId = newPart.id;
            cube.catId = newPart.catId;
            cube.manifest = newPart.manifest;
            cube.size.x = newPart.width;
            cube.size.y = newPart.height;
            cube.size.z = newPart.depth;
        }
        this.scheme.dirty = true;
    }

    addItem(newItem: Item, cubeId: string): void {
        const cube = this.findCubeById(cubeId);
        if (cube !== undefined) {
            cube.items.push(newItem);
        }

        this.scheme.dirty = true;
    }

    removeItem(itemId: string): void {
        const cubeItem = this.findCubeItemByItemId(itemId);
        if (cubeItem.cube !== undefined && cubeItem.item !== undefined) {
            const idx = cubeItem.cube.items.findIndex((item: { id: string }) => item.id === itemId);
            cubeItem.cube.items.splice(idx, 1);
        }

        this.scheme.dirty = true;
    }

    changeItem(itemId: string, newPart: Part): void {
        const cubeItem = this.findCubeItemByItemId(itemId);
        if (cubeItem.cube !== undefined && cubeItem.item !== undefined) {
            const item = cubeItem.item;
            item.partId = newPart.id;
            item.catId = newPart.catId;
            item.manifest = newPart.manifest;
            item.size.x = newPart.width;
            item.size.y = newPart.height;
            item.size.z = newPart.depth;

            // Clear old attachments and add new attachments.
            item.attachment.length = 0;
            newPart.attachments.forEach((attachment) => {
                const partCount = new PartCount(attachment.apcmid, attachment.count);
                item.attachment.push(partCount);
            });
        }
        this.scheme.dirty = true;
    }

    // TODO: support more location type, not only for up-down moving.
    moveItem(item: Item, posY: number): void {
        item.location.startPos.y = posY;
        this.scheme.dirty = true;
    }

    addDoor(newDoor: Door): void {
        this.scheme.manifest.doors.push(newDoor);
        this.scheme.dirty = true;
    }

    removeDoor(doorId: string, index = 0): void {
        const doorIndex = this.scheme.manifest.doors.findIndex((door) => {
            return door.id === doorId;
        });
        if (doorIndex !== -1) {
            const door = this.scheme.manifest.doors[doorIndex];
            let doorNum = 0;
            for (let i = 0; i < door.locations.length; i++) {
                doorNum += door.locations[i].index.length;
            }

            for (let i = 0; i < door.locations.length; i++) {
                const location = door.locations[i];
                const idx = location.index.findIndex((idx) => {
                    return idx === index;
                });
                if (idx !== -1) {
                    // decrease the attachment count.
                    door.attachment.forEach((item) => {
                        item.count -= item.count / doorNum;
                    });

                    location.index.splice(idx, 1);
                    if (location.index.length === 0) door.locations.splice(i, 1);
                    if (door.locations.length === 0) this.scheme.manifest.doors.splice(doorIndex, 1);
                    break;
                }
            }

            this.scheme.dirty = true;
        }
    }

    changeDoor(doorId: string, newPart: Part, index: number): Door | undefined {
        let resDoor: Door | undefined = undefined;
        const doorIndex = this.scheme.manifest.doors.findIndex((door) => {
            return door.id === doorId;
        });
        if (doorIndex !== -1) {
            let cubeId = "";
            const door = this.scheme.manifest.doors[doorIndex];
            let doorNum = 0;
            for (let i = 0; i < door.locations.length; i++) {
                doorNum += door.locations[i].index.length;
            }

            for (let i = 0; i < door.locations.length; i++) {
                const location = door.locations[i];
                const idx = location.index.findIndex((idx) => {
                    return idx === index;
                });
                if (idx !== -1) {
                    // decrease the attachment count.
                    door.attachment.forEach((item) => {
                        item.count -= item.count / doorNum;
                    });

                    cubeId = location.id;
                    location.index.splice(idx, 1);
                    if (location.index.length === 0) door.locations.splice(i, 1);
                    if (door.locations.length === 0) this.scheme.manifest.doors.splice(doorIndex, 1);
                    break;
                }
            }

            // Find the door with same part and cube and combine index into it.
            for (const door of this.scheme.manifest.doors) {
                if (resDoor !== undefined) break;

                if (door.partId === newPart.id) {
                    for (const location of door.locations) {
                        if (location.id === cubeId) {
                            location.index.push(index);
                            resDoor = door;
                            break;
                        }
                    }
                }
            }

            if (resDoor === undefined) {
                const newDoorId = uuidv4();
                const size = new Size(newPart.width, newPart.height, newPart.depth);
                const loc: DoorLocation = {
                    id: cubeId,
                    index: [index],
                };
                const attachment: Array<PartCount> = [];
                newPart.attachments.forEach((item) => {
                    const partCount = new PartCount(item.apcmid, item.count);
                    attachment.push(partCount);
                });
                resDoor = new Door(
                    newDoorId,
                    newPart.id,
                    newPart.manifest,
                    newPart.catId,
                    size,
                    attachment,
                    door.doorType,
                    [loc],
                );
                this.addDoor(resDoor);
            } else {
                const thatDoor = resDoor;
                newPart.attachments.forEach((item) => {
                    const partCount = thatDoor.attachment.find(
                        (partCount: { partId: number }) => partCount.partId === item.apcmid,
                    );

                    if (partCount !== undefined) {
                        partCount.count += item.count;
                    } else {
                        const partCount = new PartCount(item.apcmid, item.count);
                        thatDoor.attachment.push(partCount);
                    }
                });
            }
        }

        this.scheme.dirty = true;
        return resDoor;
    }

    getAllDoorsId(): string[] {
        const ids: string[] = [];
        this.scheme.manifest.doors.forEach((d) => {
            ids.push(d.id);
        });
        return ids;
    }

    findCubeById(id: string): Cube | undefined {
        return this.scheme.manifest.cubes.find((cube: { id: string }) => cube.id === id);
    }

    findCubeItemByItemId(itemId: string): CubeItem {
        let retCube = undefined;
        let retItem = undefined;
        this.scheme.manifest.cubes.some((cube: { items: Item[] }) => {
            const item = cube.items.find((item: { id: string }) => item.id === itemId);
            if (item !== undefined) {
                retItem = item;
                retCube = cube;
                return true;
            }
        });

        return { cube: retCube, item: retItem };
    }

    findItemById(id: string): Item | undefined {
        let retItem = undefined;
        this.scheme.manifest.cubes.some((cube: { items: Item[] }) => {
            const item = cube.items.find((item: { id: string }) => item.id === id);
            if (item !== undefined) {
                retItem = item;
                return true;
            }
        });

        return retItem;
    }

    findDoorById(id: string): Door | undefined {
        return this.scheme.manifest.doors.find((door: { id: string }) => door.id === id);
    }

    findCubeDataById(id: string): CubeData | undefined {
        const data = this.cubeMap.get(id);
        return data;
    }

    findItemsByCubeId(id: string): Item[] {
        let items: Item[] = [];
        const cube = this.findCubeById(id);
        if (cube !== undefined) items = cube.items;
        return items;
    }

    findDoorsByCubeId(cubeId: string): Door[] {
        const doors: Door[] = [];
        this.scheme.manifest.doors.forEach((door) => {
            for (const location of door.locations) {
                if (location.id === cubeId) {
                    doors.push(door);
                    break;
                }
            }
        });

        return doors;
    }
}
