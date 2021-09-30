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

    addPart(partId: number): void {
        const partCount = this.findPartCountById(partId);
        if (partCount !== undefined) {
            partCount.count += 1;
        } else {
            const newPartCount = new PartCount(partId, 1);
            this.scheme.composition.push(newPartCount);
        }

        this.scheme.dirty = true;
    }

    removePart(partId: number): void {
        const partCount = this.findPartCountById(partId);
        if (partCount !== undefined) {
            partCount.count -= 1;
        }

        this.scheme.dirty = true;
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

        this.addPart(newCube.partId);

        this.scheme.dirty = true;
    }

    removeCube(cubeId: string): void {
        const idx = this.scheme.manifest.cubes.findIndex((cube: { id: string }) => cube.id === cubeId);
        const cube = this.scheme.manifest.cubes[idx];
        const partId = cube.partId;

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
        this.removePart(partId);

        this.cubeMap.delete(cubeId);

        this.scheme.dirty = true;
    }

    changeCube(cubeId: string, newPart: Part): void {
        const cube = this.findCubeById(cubeId);
        if (cube !== undefined) {
            const oldPartId = cube.partId;
            cube.partId = newPart.id;
            cube.catId = newPart.catId;
            cube.manifest = newPart.manifest;
            cube.size.x = newPart.width;
            cube.size.y = newPart.height;
            cube.size.z = newPart.depth;

            this.removePart(oldPartId);
            this.addPart(newPart.id);
        }
        this.scheme.dirty = true;
    }

    addItem(newItem: Item, cubeId: string): void {
        const cube = this.findCubeById(cubeId);
        if (cube !== undefined) {
            cube.items.push(newItem);
        }

        this.addPart(newItem.partId);

        this.scheme.dirty = true;
    }

    removeItem(itemId: string): void {
        const cubeItem = this.findCubeItemByItemId(itemId);
        if (cubeItem.cube !== undefined && cubeItem.item !== undefined) {
            const idx = cubeItem.cube.items.findIndex((item: { id: string }) => item.id === itemId);
            cubeItem.cube.items.splice(idx, 1);

            this.removePart(cubeItem.item.partId);
        }

        this.scheme.dirty = true;
    }

    changeItem(itemId: string, newPart: Part): void {
        const cubeItem = this.findCubeItemByItemId(itemId);
        if (cubeItem.cube !== undefined && cubeItem.item !== undefined) {
            const oldPartId = cubeItem.item.partId;
            cubeItem.item.partId = newPart.id;
            cubeItem.item.catId = newPart.catId;
            cubeItem.item.manifest = newPart.manifest;
            cubeItem.item.size.x = newPart.width;
            cubeItem.item.size.y = newPart.height;
            cubeItem.item.size.z = newPart.depth;

            this.removePart(oldPartId);
            this.addPart(newPart.id);
        }
        this.scheme.dirty = true;
    }

    addDoor(newDoor: Door): void {
        this.scheme.manifest.doors.push(newDoor);

        let doorNum = 0;
        newDoor.locations.forEach((location) => {
            doorNum += location.index.length;
        });
        for (let i = 0; i < doorNum; i++) this.addPart(newDoor.partId);
        this.scheme.dirty = true;
    }

    removeDoor(doorId: string, index = 0): void {
        const doorIndex = this.scheme.manifest.doors.findIndex((door) => {
            return door.id === doorId;
        });
        if (doorIndex !== -1) {
            const door = this.scheme.manifest.doors[doorIndex];
            for (let i = 0; i < door.locations.length; i++) {
                const location = door.locations[i];
                const idx = location.index.findIndex((idx) => {
                    return idx === index;
                });
                if (idx !== -1) {
                    this.removePart(door.partId);

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
        let resDoor = undefined;
        const doorIndex = this.scheme.manifest.doors.findIndex((door) => {
            return door.id === doorId;
        });
        if (doorIndex !== -1) {
            let cubeId = "";
            const door = this.scheme.manifest.doors[doorIndex];
            for (let i = 0; i < door.locations.length; i++) {
                const location = door.locations[i];
                const idx = location.index.findIndex((idx) => {
                    return idx === index;
                });
                if (idx !== -1) {
                    this.removePart(door.partId);

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
                resDoor = new Door(newDoorId, newPart.id, newPart.manifest, newPart.catId, size, door.doorType, [loc]);
                this.addDoor(resDoor);
            } else {
                this.addPart(resDoor.partId);
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

    findPartCountById(id: number): PartCount | undefined {
        return this.scheme.composition.find((part: { partId: number }) => part.partId === id);
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
