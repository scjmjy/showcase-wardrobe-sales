/* eslint @typescript-eslint/no-var-requires: "off" */
import {
    Scheme,
    SchemeObject,
    Cube,
    Item,
    Door,
    Part,
    Position,
    Size,
    RelativeItem,
    Location,
    DoorLocation,
    Config,
} from "@/lib/scheme";
import request from "@/utils/request";
import apiProvider from "@/api/provider";
import { base64toBlob } from "@/utils/base64";

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
            url: url + `?timestamp=${Date.now()}`, // add timestamp to disable browser cache
            method: "GET",
            responseType: "json",
        })
            .then((res) => {
                const mf = res.data;
                console.log(mf);

                let config: Config | null = null;
                if (mf.config) {
                    let cubeSize = null;
                    let standardCube = null;
                    if (mf.config.cubeSize !== undefined) {
                        cubeSize = {
                            top: mf.config.cubeSize.top,
                            bottom: mf.config.cubeSize.bottom,
                            left: mf.config.cubeSize.left,
                            right: mf.config.cubeSize.right,
                            back: mf.config.cubeSize.back,
                        };
                    }

                    if (mf.config.standardCube !== undefined) {
                        const size = mf.config.standardCube.size;
                        standardCube = {
                            partId: mf.config.standardCube.partId,
                            catId: mf.config.standardCube.catId,
                            manifest: mf.config.standardCube.manifest,
                            size: new Size(size.x, size.y, size.z),
                        };
                    }

                    config = new Config(cubeSize, standardCube);
                }

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
                    const locations: DoorLocation[] = [];
                    door.locations?.forEach((location: any) => {
                        const indexArr: number[] = [];
                        location.index.forEach((doorIndex: number) => {
                            indexArr.push(doorIndex);
                        });

                        const doorLocation = {
                            id: location.id,
                            index: indexArr,
                        };
                        locations.push(doorLocation);
                    });

                    const size = new Size(door.size.x, door.size.y, door.size.z);
                    const newDoor = new Door(
                        door.id,
                        door.partId,
                        door.manifest,
                        door.catId,
                        size,
                        door.doorType,
                        locations,
                    );
                    doors.push(newDoor);
                });

                const parts: Part[] = [];
                mf.composition.forEach((part: any) => {
                    const newPart = new Part(part.partId, part.count);
                    parts.push(newPart);
                });

                const scheme = new Scheme(config, background, cubes, doors, parts);
                resolve(scheme);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function scheme2manifest(scheme: Scheme) {
    let config = null;
    if (scheme.config !== null) {
        config = {
            cubeSize: scheme.config.cubeSize,
            standardCube: scheme.config.standardCube,
        };
    }
    const manifest = {
        background: scheme.background,
        cubes: scheme.cubes,
        doors: scheme.doors,
    };
    const composition = scheme.parts.filter((p) => p.count > 0);
    const mf = { config, manifest, composition };
    return JSON.stringify(mf, undefined, 4);
}

export async function saveSchemeAsync(schemeId: string | number, scheme: Scheme) {
    const res = await apiProvider.requestSignedUrl(schemeId);
    if (res.ok && res.data) {
        const { accessid, policy, signature, host, dir, filename } = res.data;
        const formData = new FormData();
        formData.append("key", dir + filename);
        formData.append("OSSAccessKeyId", accessid);
        formData.append("policy", policy);
        formData.append("Signature", signature);
        const schemeJSON = scheme2manifest(scheme);
        const file = new Blob([schemeJSON], { type: "application/json" });
        formData.append("file", file, filename);
        const saveRes = await request({
            method: "POST",
            url: host,
            data: formData,
        });
        await apiProvider.updateSchemeState(schemeId);
        scheme.dirty = false;
        return true;
    } else {
        return Promise.reject();
    }
}

export function updateSchemeMetalCount(scheme: Scheme, partId: number, value: number) {
    const { parts } = scheme;
    const found = parts.find((p) => p.partId === partId);
    if (found) {
        found.count = value;
        scheme.dirty = true;
        return true;
    }
    return false;
}

export async function uploadSchemeScreenshot(schemeId: string | number, base64: string) {
    const blob = base64toBlob(base64);
    if (!blob) {
        return Promise.reject("Base64 解码失败！");
    }
    const res = await apiProvider.requestScreenshotSignedUrl(schemeId);
    if (res.ok && res.data) {
        const { accessid, policy, signature, host, dir, filename } = res.data;
        const formData = new FormData();
        formData.append("key", dir + filename);
        formData.append("OSSAccessKeyId", accessid);
        formData.append("policy", policy);
        formData.append("Signature", signature);
        formData.append("file", blob, filename);
        const _saveRes = await request({
            method: "POST",
            url: host,
            data: formData,
        });
        await apiProvider.updateScreenshotState(schemeId, dir + filename);
        return true;
    } else {
        return Promise.reject();
    }
}
