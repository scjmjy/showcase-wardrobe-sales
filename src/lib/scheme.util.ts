/* eslint @typescript-eslint/no-var-requires: "off" */
import { Scheme, Cube, Item, Door, Part, Position, RelativeItem, Location } from "@/lib/scheme";

export function parseManifest(url: string) {
    // TODO: why cannot require from public folder?
    // return require("/" + url);
    return require("@/assets/" + url);
}

export function importSchemeJson(url: string) {
    const mf = require("@/assets/" + url);

    const background: Item[] = [];
    mf.manifest.background.forEach((element: any) => {
        const item = new Item(element.id, element.partId, element.manifest);
        background.push(item);
    });

    const cubes: Cube[] = [];
    mf.manifest.cubes.forEach((cube: any) => {
        const items: Item[] = [];
        cube.items.forEach((item: any) => {
            let startPos = null;
            let relativeItem = null;
            switch (item.location.locationType) {
                case 1:
                case 2:
                    {
                        startPos = new Position(
                            item.location.startPos.x,
                            item.location.startPos.y,
                            item.location.startPos.z,
                        );
                    }
                    break;
                case 3:
                    {
                        const relativePosition = new Position(
                            item.location.relativeItem.relativePosition.x,
                            item.location.relativeItem.relativePosition.y,
                            item.location.relativeItem.relativePosition.z,
                        );

                        relativeItem = new RelativeItem(
                            item.location.relativeItem.relativeItemId,
                            item.location.relativeItem.relativeType,
                            relativePosition,
                        );
                    }
                    break;
            }

            const location = new Location(item.location.locationType, startPos, relativeItem);
            const newItem = new Item(item.id, item.partId, item.manifest, location);
            items.push(newItem);
        });

        const newCube = new Cube(cube.id, cube.partId, cube.manifest, items);
        cubes.push(newCube);
    });

    const doors: Door[] = [];
    mf.manifest.doors.forEach((door: any) => {
        const doorCubes: string[] = [];
        door.cubes.forEach((cube: string) => {
            doorCubes.push(cube);
        });

        const newDoor = new Door(door.id, door.partId, door.manifest, door.doorType, doorCubes);
        doors.push(newDoor);
    });

    const parts: Part[] = [];
    mf.composition.forEach((part: any) => {
        const newPart = new Part(part.partId, part.count);
        parts.push(newPart);
    });

    return new Scheme(background, cubes, doors, parts);
}
