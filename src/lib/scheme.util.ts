/* eslint @typescript-eslint/no-var-requires: "off" */
import { Scheme, SchemeObject, Cube, Item, Door, Part, Position, Size, RelativeItem, Location } from "@/lib/scheme";
import request from "@/utils/request";

export const BASE_OSS_URL = "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/";

// export function requestJsonAsync(url: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open("GET", url, true);
//         // xhr.overrideMimeType("text/html;charset=utf-8");
//         xhr.send();
//         xhr.onreadystatechange = function () {
//             if (xhr.readyState == 4 && xhr.status == 200) {
//                 resolve(xhr.responseText);
//             }
//         };
//     });
// }

// export function parseManifest(url: string) {
//     // TODO: why cannot require from public folder?
//     // return require("/" + url);
//     return require("@/assets/" + url);
// }

export function importSchemeJson(url: string): Promise<Scheme> {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: "GET",
            responseType: "json",
        })
            .then((res) => {
                const mf = res.data;

                const background: SchemeObject[] = [];
                mf.manifest.background.forEach((element: any) => {
                    const schemeObject = new SchemeObject(element.id, element.partId, element.manifest);
                    background.push(schemeObject);
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

                        const size = new Size(item.size.x, item.size.y, item.size.z);
                        const location = new Location(item.location.locationType, startPos, relativeItem);
                        const newItem = new Item(item.id, item.partId, item.manifest, item.catId, size, location);
                        items.push(newItem);
                    });

                    const size = new Size(cube.size.x, cube.size.y, cube.size.z);
                    const newCube = new Cube(cube.id, cube.partId, cube.manifest, cube.catId, size, items);
                    cubes.push(newCube);
                });

                const doors: Door[] = [];
                mf.manifest.doors.forEach((door: any) => {
                    const doorCubes: string[] = [];
                    door.cubes.forEach((cube: string) => {
                        doorCubes.push(cube);
                    });

                    const size = new Size(door.size.x, door.size.y, door.size.z);
                    const newDoor = new Door(
                        door.id,
                        door.partId,
                        door.manifest,
                        door.catId,
                        size,
                        door.doorType,
                        doorCubes,
                    );
                    doors.push(newDoor);
                });

                const parts: Part[] = [];
                mf.composition.forEach((part: any) => {
                    const newPart = new Part(part.partId, part.count);
                    parts.push(newPart);
                });

                const scheme = new Scheme(background, cubes, doors, parts);
                resolve(scheme);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
