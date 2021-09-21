import { Scheme, Cube, Item, Door, Part, PartType } from "@/lib/scheme";
import { StObject } from "./utility/st_object";
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
    public partManifestMap: Map<string, string>;

    constructor(scheme: Scheme) {
        this.scheme = scheme;
        this.cubeMap = new Map<string, CubeData>();
        this.partManifestMap = new Map<string, string>();

        // TODO: get the map of partId & manifest from backend.
        this.partManifestMap.set(
            "100001",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/69771f55-f709-4f9b-96b6-0af6eafc4a26.jpg",
        );
        this.partManifestMap.set(
            "100002",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/d8282dee-13f2-4884-99c0-5d56962d95ac.jpg",
        );
        this.partManifestMap.set(
            "100003",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/d6733d2b-a73f-449f-aec9-4da25a980e30.jpg",
        );
        this.partManifestMap.set(
            "100004",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/d6505e88-aa64-4ce8-adae-2b62796d9397.jpg",
        );

        this.partManifestMap.set(
            "110001",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/00ac1404-b1c5-4a88-bc5c-2fe1480d9e30.jpg",
        );
        this.partManifestMap.set(
            "110002",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/97b67520-88f8-4b92-ae9a-e39c4e641215.jpg",
        );
        this.partManifestMap.set(
            "110003",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/cc720923-b9d4-4ad1-af1e-db98151cacec.jpg",
        );
        this.partManifestMap.set(
            "110004",
            "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/dc5eb19b-2879-47fe-a517-720b39e0f445.jpg",
        );
    }

    addPart(partId: number): void {
        const part = this.findPartById(partId);
        if (part !== undefined) {
            part.count += 1;
        } else {
            const newPart = new Part(partId, 1);
            this.scheme.parts.push(newPart);
        }

        this.scheme.dirty = true;
    }

    removePart(partId: number): void {
        const part = this.findPartById(partId);
        if (part !== undefined) {
            part.count -= 1;
        }

        this.scheme.dirty = true;
    }

    addCube(newCube: Cube, isFirstCube: boolean): void {
        if (isFirstCube) {
            this.startX += newCube.size.x;
            this.scheme.cubes.unshift(newCube);
        } else {
            this.endX -= newCube.size.x;
            this.scheme.cubes.push(newCube);
        }
        this.totalWidth += newCube.size.x;
        if (newCube.size.y > this.totalHeight) this.totalHeight = newCube.size.y;
        if (newCube.size.z > this.totalDepth) this.totalDepth = newCube.size.z;

        this.addPart(newCube.partId);

        this.scheme.dirty = true;
    }

    removeCube(cubeId: string): void {
        const idx = this.scheme.cubes.findIndex((cube: { id: string }) => cube.id === cubeId);
        const cube = this.scheme.cubes[idx];
        const partId = cube.partId;

        if (idx === 0) {
            // Remove the first cube.
            this.startX -= cube.size.x;
        } else if (idx == this.scheme.cubes.length - 1) {
            // Remove the last cube.
            this.endX += cube.size.x;
        }
        this.totalWidth -= cube.size.x;
        // TODO: handle the case of the different cube height and depth.

        this.scheme.cubes.splice(idx, 1);
        this.removePart(partId);

        this.scheme.dirty = true;
    }

    changeCube(cubeId: string, newPart: PartType): void {
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

    changeItem(itemId: string, newPart: PartType): void {
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
        this.scheme.doors.push(newDoor);
        this.addPart(newDoor.partId);
        this.scheme.dirty = true;
    }

    removeDoor(id: string): Door | undefined {
        const idx = this.scheme.doors.findIndex((d) => {
            return d.id === id;
        });
        if (idx == -1) return;
        const array = this.scheme.doors.splice(idx, 1);

        this.removePart(array[0].partId);
        this.scheme.dirty = true;

        return array[0];
    }

    changeDoor(doorId: string, newPart: PartType): void {
        const door = this.findDoorById(doorId);
        if (door !== undefined) {
            const oldPartId = door.partId;
            door.partId = newPart.id;
            door.catId = newPart.catId;
            door.manifest = newPart.manifest;
            door.size.x = newPart.width;
            door.size.y = newPart.height;
            door.size.z = newPart.depth;

            this.removePart(oldPartId);
            this.addPart(newPart.id);
        }
        this.scheme.dirty = true;
    }

    getAllDoorsId(): string[] {
        const ids: string[] = [];
        this.scheme.doors.forEach((d) => {
            ids.push(d.id);
        });
        return ids;
    }

    findCubeById(id: string): Cube | undefined {
        return this.scheme.cubes.find((cube: { id: string }) => cube.id === id);
    }

    findCubeItemByItemId(itemId: string): CubeItem {
        let retCube = undefined;
        let retItem = undefined;
        this.scheme.cubes.some((cube: { items: Item[] }) => {
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
        this.scheme.cubes.some((cube: { items: Item[] }) => {
            const item = cube.items.find((item: { id: string }) => item.id === id);
            if (item !== undefined) {
                retItem = item;
                return true;
            }
        });

        return retItem;
    }

    findDoorById(id: string): Door | undefined {
        return this.scheme.doors.find((door: { id: string }) => door.id === id);
    }

    findPartById(id: number): Part | undefined {
        return this.scheme.parts.find((part: { partId: number }) => part.partId === id);
    }

    findCubeDataById(id: string): CubeData | undefined {
        const data = this.cubeMap.get(id);
        return data;
    }

    findCubeItems(id: string): Item[] | null {
        let cube: Cube | null = null;
        for (const c of this.scheme.cubes) {
            if (c.id == id) {
                cube = c;
                break;
            }
        }
        if (!cube) return null;
        return cube.items;
    }

    findDoorByCubeId(cubeId: string): Door | undefined {
        let resDoor = undefined;
        this.scheme.doors.some((door) => {
            if (door.cubes.indexOf(cubeId) !== -1) {
                resDoor = door;
                return true;
            }
        });

        return resDoor;
    }
}
