<template>
    <div>
        <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import * as BABYLON from "babylonjs";
import { Graphics, GraphicsEvent } from "@/lib/graphics";
import { Scheme, Cube, Item, Door, Part, PartCount, Location, Size, SizeConfig } from "@/lib/scheme";
import { BizData, ObjectType } from "@/lib/biz.data";
import { v4 as uuidv4 } from "uuid";
import request from "@/utils/request";
import { drobeUtil } from "@/lib/drobe.util";
import * as event from "@/lib/biz.event";
import { PopupGUI } from "@/lib/hm_gui";
import { ElMessage } from "element-plus";

import { GeneralStl, StlConfig } from "@/lib/stl";
import { AreaHints, Area } from "@/lib/model/hint";
import { AnchorMeta } from "@/lib/model/pscope";

import { IndexDb, DBValue } from "@/lib/indexdb";
import { Size3D } from "@/api/interface/common.interface";

export default defineComponent({
    name: "Babylon",
    props: {
        canvasWidth: {
            type: Number,
            default: 1366,
        },
        canvasHeight: {
            type: Number,
            default: 1024,
        },
        // 3D model:
        // 1 - 外观（free camera，内配不能被选择）
        // 2 - 内配（fixed camera，柜体不能被选择）
        // 3 - 浏览模式（free camera，柜体和内配都不能选择）
        mode: {
            type: Number,
            default: 3,
        },
        // scheme type:
        // 0 - 定制商品
        // 1 - 非定制商品
        schemeType: {
            type: Number,
            default: 0,
        },
        scheme: {
            type: Scheme,
            default: null,
        },
        size: {
            type: Object as PropType<Size3D>,
            default: () => ({ width: 0, height: 0, depth: 0 }),
        },
        baseOSSUrl: {
            type: String,
            default: "",
        },
        selectedPart: {
            type: Object as PropType<Part>,
            default: () => ({
                id: 0,
                width: 0,
                height: 0,
                depth: 0,
                manifest: "",
                catId: 0,
            }),
        },
        eventEmit: {
            type: Function,
            default: () => {},
        },
    },
    data() {
        return {
            bizdata: {} as BizData,
            availableAreas: [] as BABYLON.Mesh[],
            floor: {} as BABYLON.Mesh,
            wall: {} as BABYLON.Mesh,
            newPart: {} as Part,
            schemeModelCount: 0,
            loadedModelCount: 0,
            stl: {} as GeneralStl,
            areaHints: {} as AreaHints,
            defaultPartType: 1,
            indexDb: {} as IndexDb,
        };
    },
    computed: {
        graphics() {
            const canvas = document.getElementById("canvas") as HTMLCanvasElement;
            return new Graphics(canvas);
        },

        gui() {
            return new PopupGUI();
        },
    },
    watch: {
        selectedPart: {
            deep: true,
            handler(newPart: Part) {
                if (newPart.id !== undefined) {
                    console.log("[Watch selectedPart] ", newPart);
                    this.newPart = newPart;

                    if (this.graphics.currentMesh !== null) {
                        const info = this.graphics.currentMesh.name.split("_");
                        const objectType = info[0];
                        const objectId = info[1];
                        switch (objectType) {
                            case ObjectType.CUBE:
                                {
                                    // TODO: remove the hardcode of adjusting whether it is a cube or door.
                                    if (newPart.catId === 20) {
                                        this.changeCubeApi(objectId, newPart);
                                    } else if (newPart.catId === 2 || newPart.catId === 3) {
                                        const doors = this.bizdata.findDoorsByCubeId(objectId);
                                        doors.forEach((door) => {
                                            this.removeDoorApi(door);
                                        });

                                        // Add new door.
                                        const doorId = uuidv4();
                                        const size = new Size(newPart.width, newPart.height, newPart.depth);
                                        let doorType = 1;
                                        if (newPart.catId === 2) doorType = 2;

                                        const cube = this.bizdata.findCubeById(objectId);
                                        if (cube !== undefined) {
                                            let doorNum = Math.floor(cube.size.x / newPart.width);
                                            if (doorNum === 0) {
                                                doorNum = 1;
                                                ElMessage({
                                                    type: "warning",
                                                    message: "门的宽度超过了当前柜体的宽度",
                                                });
                                            }

                                            const indexArr = [];
                                            for (let i = 0; i < doorNum; i++) indexArr.push(i);
                                            const loc = {
                                                id: objectId,
                                                index: indexArr,
                                            };

                                            const attachment: Array<PartCount> = [];
                                            newPart.attachments.forEach((item) => {
                                                const partCount = new PartCount(item.apcmid, item.count * doorNum);
                                                attachment.push(partCount);
                                            });

                                            const newDoor = new Door(
                                                doorId,
                                                newPart.id,
                                                newPart.manifest,
                                                newPart.catId,
                                                size,
                                                attachment,
                                                doorType,
                                                [loc],
                                            );
                                            this.addDoorApi(newDoor);
                                        }
                                    }
                                }
                                break;
                            case ObjectType.DOOR:
                                {
                                    const doorIndex = parseInt(info[2]);
                                    this.changeDoorApi(objectId, newPart, doorIndex);
                                }
                                break;
                            case ObjectType.ITEM:
                                this.changeItemApi(objectId, newPart);
                                break;
                        }
                    } else {
                        // TODO: remove the hardcode of adjusting whether it is a cube or door.
                        if (newPart.catId === 20) {
                            // TODO: remove the function of adding new cube.
                            // this.ShowCubeAddArea(newPart);
                            // Change all cubes if no cube is selected.
                            this.changeAllCubes(newPart);
                        } else if (newPart.catId === 2 || newPart.catId === 3) {
                            this.changeAllDoors(newPart);
                        } else {
                            // old way:
                            // const availableArea = this.getAvailableAreaByPart(newPart);
                            // this.ShowAvailableArea(newPart, availableArea);

                            this.areaHints = this.stl.computeAreaHints(
                                this.scheme.manifest,
                                this.defaultPartType,
                                new Size(newPart.width, newPart.height, newPart.depth),
                            );
                            this.ShowAvailableArea(newPart, this.areaHints);
                        }
                    }
                }
            },
        },
        mode: {
            deep: true,
            handler(newMode: number) {
                this.setModeApi(newMode);
            },
        },
    },
    async mounted() {
        const sizeConfig = this.scheme.config !== null ? this.scheme.config.sizeConfig : new SizeConfig();
        this.stl = new GeneralStl(new StlConfig(0.1, 0, 0.1, sizeConfig));
        this.bizdata = new BizData(this.scheme);
        this.indexDb = new IndexDb();

        // set the scene size as 7.5m.
        this.graphics.init(7.5 * this.bizdata.SceneUnit);
        this.graphics.render();

        this.graphics.setBackgroundColor(BABYLON.Color4.FromHexString("#F2F4F0FF"));

        this.setupInteraction();
        this.setupKeyboard();
        this.handleGraphicsEvent(this.graphics);

        // this.setupWallandFloor();
        this.loadScheme(this.schemeType);
    },
    methods: {
        /**
         * 修改墙面
         */
        changeWallApi(part: Part): void {
            const wall_material = new BABYLON.StandardMaterial("WallMaterial", this.graphics.scene as BABYLON.Scene);
            wall_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            const url = this.baseOSSUrl + part.manifest;
            const texture = new BABYLON.Texture(url, this.graphics.scene as BABYLON.Scene);
            texture.uScale = 1;
            texture.vScale = 1;
            wall_material.diffuseTexture = texture;
            this.wall.material = wall_material;
        },

        /**
         * 修改地板
         */
        changeFloorApi(part: Part): void {
            const floor_material = new BABYLON.StandardMaterial("floorMaterial", this.graphics.scene as BABYLON.Scene);
            floor_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            const url = this.baseOSSUrl + part.manifest;
            const texture = new BABYLON.Texture(url, this.graphics.scene as BABYLON.Scene);
            texture.uScale = 2;
            texture.vScale = 2;
            floor_material.diffuseTexture = texture;
            this.floor.material = floor_material;
        },

        /**
         * 修改单元柜的材质或颜色
         * @param cubeId 需要修改的单元柜id
         * @param newPart 修改后单元柜对应的part
         */
        changeCubeApi(cubeId: string, newPart: Part): void {
            const meshName = ObjectType.CUBE + "_" + cubeId;
            const mesh = this.graphics.scene.getMeshByName(meshName);
            if (mesh !== null) {
                const cube = this.bizdata.findCubeById(cubeId);
                if (
                    cube !== undefined &&
                    cube.size.x === newPart.width &&
                    cube.size.y === newPart.height &&
                    cube.size.z === newPart.depth
                ) {
                    const pos = mesh.position.clone();
                    request({
                        url: this.baseOSSUrl + newPart.manifest,
                        method: "GET",
                        responseType: "json",
                    })
                        .then((res) => {
                            const itemMf = res.data;
                            itemMf.models.forEach(async (model: any) => {
                                const modelPos = new BABYLON.Vector3(
                                    pos.x + model.position.x,
                                    pos.y + model.position.y,
                                    pos.z + model.position.z,
                                );
                                const modelScaling = new BABYLON.Vector3(
                                    model.scaling.x,
                                    model.scaling.y,
                                    model.scaling.z,
                                );

                                let rootUrl = "file:///";
                                let modelUrl = model.url;
                                const modelFile = await this.loadModelFromDB(modelUrl);
                                if (modelFile === null) {
                                    rootUrl = "";
                                    modelUrl = this.baseOSSUrl + model.url;
                                }
                                this.graphics.importMesh(
                                    modelUrl,
                                    meshName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    true,
                                    rootUrl,
                                );
                            });

                            // clear select item
                            this.clearSelectionApi();
                            // remove the old item
                            mesh.dispose();

                            this.bizdata.changeCube(cubeId, newPart);
                        })
                        .catch((err) => {
                            throw Error(`Load part manifest by error: ${err}`);
                        });
                } else {
                    ElMessage({
                        type: "warning",
                        message: "不能更换不同尺寸的柜体",
                    });
                }
            }
        },

        // Remove cube and its relatived items and doors.
        // TODO: re-arrage the position of other cubes if removing middle cube.
        removeCubeApi(cube: Cube): void {
            const items = this.bizdata.findItemsByCubeId(cube.id);
            const itemNum = items.length;
            for (let i = itemNum - 1; i >= 0; i--) {
                this.removeItemApi(items[i]);
            }

            const doors = this.bizdata.findDoorsByCubeId(cube.id);
            const doorNum = doors.length;
            for (let i = doorNum - 1; i >= 0; i--) {
                this.removeDoorApi(doors[i]);
            }

            const meshName = ObjectType.CUBE + "_" + cube.id;
            const mesh = this.graphics.scene.getMeshByName(meshName);
            if (mesh !== null) {
                mesh.dispose();
                this.bizdata.removeCube(cube.id);
            }
        },

        changeAllCubes(newPart: Part): void {
            this.graphics.scene.meshes.forEach((mesh) => {
                const info = mesh.name.split("_");
                const objectType = info[0];
                const cubeId = info[1];
                if (objectType === ObjectType.CUBE) {
                    const cube = this.bizdata.findCubeById(cubeId);
                    if (
                        cube !== undefined &&
                        cube.size.x === newPart.width &&
                        cube.size.y === newPart.height &&
                        cube.size.z === newPart.depth
                    ) {
                        this.changeCubeApi(cubeId, newPart);
                    }
                }
            });
        },

        // Change scheme size
        changeSchemeSize(width: number, height: number, depth: number) {
            height;
            depth;
            if (this.scheme.config === null || this.scheme.config.standardCube === null) return;

            const standardCube = this.scheme.config.standardCube;
            if (width > this.bizdata.totalWidth) {
                const endX = this.bizdata.endX;
                const cubeNum = Math.round((width - this.bizdata.totalWidth) / standardCube.size.x);
                const manifest = standardCube.manifest;
                for (let i = 0; i < cubeNum; i++) {
                    request({
                        url: this.baseOSSUrl + standardCube.manifest,
                        method: "GET",
                        responseType: "json",
                    })
                        .then((res) => {
                            const cubeMf = res.data;
                            const cubeUUID = uuidv4();
                            const originX = endX - standardCube.size.x * (i + 0.5);
                            const itemOrigin = new BABYLON.Vector3(originX, 0, 0);

                            // TODO: create a parent mesh to contain all import meshes.
                            cubeMf.models.forEach(async (model: any) => {
                                const modelPos = new BABYLON.Vector3(
                                    itemOrigin.x + model.position.x,
                                    itemOrigin.y + model.position.y,
                                    itemOrigin.z + model.position.z,
                                );
                                const modelScaling = new BABYLON.Vector3(
                                    model.scaling.x,
                                    model.scaling.y,
                                    model.scaling.z,
                                );
                                const itemName = ObjectType.CUBE + "_" + cubeUUID;

                                let rootUrl = "file:///";
                                let modelUrl = model.url;
                                const modelFile = await this.loadModelFromDB(modelUrl);
                                if (modelFile === null) {
                                    rootUrl = "";
                                    modelUrl = this.baseOSSUrl + model.url;
                                }
                                this.graphics.importMesh(
                                    modelUrl,
                                    itemName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    true,
                                    rootUrl,
                                );
                            });

                            const partId = standardCube.partId;
                            const catId = standardCube.catId;
                            const size = new Size(standardCube.size.x, standardCube.size.y, standardCube.size.z);
                            const items: Item[] = [];
                            const newCube = new Cube(cubeUUID, partId, manifest, catId, size, items);
                            this.bizdata.addCube(newCube);

                            this.bizdata.cubeMap.set(newCube.id, {
                                origin: itemOrigin,
                                width: newCube.size.x,
                                height: newCube.size.y,
                                depth: newCube.size.z,
                            });

                            this.adjustCamera();
                        })
                        .catch(() => {
                            throw Error(`Require manifest by error: ${manifest}`);
                        });
                }
            } else {
                const cubeNum = Math.round((this.bizdata.totalWidth - width) / standardCube.size.x);
                for (let i = 0; i < cubeNum; i++) {
                    const cube = this.scheme.manifest.cubes[this.scheme.manifest.cubes.length - 1];
                    this.removeCubeApi(cube);
                }

                this.adjustCamera();
            }
        },

        /**
         * 增加一个item
         */
        addItemApi(item: Item): void {
            item;
        },

        /**
         * 移除item
         * @param itemId 被移除item的uuid
         */
        removeItemApi(item: Item): void {
            const meshName = ObjectType.ITEM + "_" + item.id;
            const mesh = this.graphics.scene.getMeshByName(meshName);
            if (mesh !== null) {
                mesh.dispose();
                this.bizdata.removeItem(item.id);
            }
        },

        /**
         * 修改配件的材质或颜色
         * @param itemId 需要修改的item id
         * @param newPartId 修改后配件对应的part
         */
        changeItemApi(itemId: string, newPart: Part): void {
            const meshName = ObjectType.ITEM + "_" + itemId;
            const mesh = this.graphics.scene.getMeshByName(meshName);
            if (mesh !== null) {
                const cubeItem = this.bizdata.findCubeItemByItemId(itemId);
                if (
                    cubeItem.cube !== undefined &&
                    cubeItem.item !== undefined &&
                    cubeItem.item.size.x === newPart.width &&
                    cubeItem.item.size.y === newPart.height &&
                    cubeItem.item.size.z === newPart.depth
                ) {
                    const pos = mesh.position.clone();
                    request({
                        url: this.baseOSSUrl + newPart.manifest,
                        method: "GET",
                        responseType: "json",
                    })
                        .then((res) => {
                            const itemMf = res.data;
                            itemMf.models.forEach(async (model: any) => {
                                const modelPos = new BABYLON.Vector3(
                                    pos.x + model.position.x,
                                    pos.y + model.position.y,
                                    pos.z + model.position.z,
                                );
                                const modelScaling = new BABYLON.Vector3(
                                    model.scaling.x,
                                    model.scaling.y,
                                    model.scaling.z,
                                );

                                let rootUrl = "file:///";
                                let modelUrl = model.url;
                                const modelFile = await this.loadModelFromDB(modelUrl);
                                if (modelFile === null) {
                                    rootUrl = "";
                                    modelUrl = this.baseOSSUrl + model.url;
                                }
                                this.graphics.importMesh(
                                    modelUrl,
                                    meshName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    true,
                                    rootUrl,
                                );
                            });

                            // clear select item
                            this.clearSelectionApi();
                            // remove the old item
                            mesh.dispose();

                            this.bizdata.changeItem(itemId, newPart);
                        })
                        .catch((err) => {
                            throw Error(`Load part manifest by error: ${err}`);
                        });
                } else {
                    ElMessage({
                        type: "warning",
                        message: "不能更换不同尺寸的内配",
                    });
                }
            }
        },

        /**
         * 增加一组合页门或者滑门
         * @param newDoor 新增加的Door
         */
        addDoorApi(newDoor: Door, isPickable = true, loadingSheme = false): void {
            request({
                url: this.baseOSSUrl + newDoor.manifest,
                method: "GET",
                responseType: "json",
            })
                .then((res) => {
                    const itemMf = res.data;
                    const doorWidth = itemMf.size.x;
                    newDoor.locations.forEach((location) => {
                        const cubeId = location.id;
                        const cubeData = this.bizdata.findCubeDataById(cubeId);
                        if (cubeData === undefined) {
                            throw Error(`cannot find cube data by id: ${cubeId}`);
                        } else {
                            this.schemeModelCount += location.index.length;

                            location.index.forEach(async (index) => {
                                const doorPosX = cubeData.origin.x + cubeData.width * 0.5 - doorWidth * (index + 0.5);
                                const doorPosY = 0.03;
                                const modelIndex = index % itemMf.models.length;
                                const model = itemMf.models[modelIndex];
                                const modelPos = new BABYLON.Vector3(
                                    doorPosX + model.position.x,
                                    doorPosY + model.position.y,
                                    cubeData.depth * 0.5 + newDoor.size.z * 0.5 + model.position.z,
                                );
                                const modelScaling = new BABYLON.Vector3(
                                    model.scaling.x,
                                    model.scaling.y,
                                    model.scaling.z,
                                );
                                const doorName = ObjectType.DOOR + "_" + newDoor.id + "_" + index;

                                let rootUrl = "file:///";
                                let modelUrl = model.url;
                                const modelFile = await this.loadModelFromDB(modelUrl);
                                if (modelFile === null) {
                                    rootUrl = "";
                                    modelUrl = this.baseOSSUrl + model.url;
                                }
                                this.graphics
                                    .importMesh(
                                        modelUrl,
                                        doorName,
                                        modelPos,
                                        BABYLON.Vector3.Zero(),
                                        modelScaling,
                                        isPickable,
                                        rootUrl,
                                    )
                                    .then((/*mesh*/) => {
                                        if (loadingSheme && ++this.loadedModelCount >= this.schemeModelCount)
                                            this.loadSchemeCompleted();
                                    });
                            });

                            if (!loadingSheme) this.bizdata.addDoor(newDoor);
                        }
                    });

                    // clear select item
                    this.clearSelectionApi();
                })
                .catch((err) => {
                    throw Error(`Load part manifest by error: ${err}`);
                });
        },

        /**
         * 移除合页门或者滑门
         */
        removeDoorApi(door: Door): void {
            const doorName = ObjectType.DOOR + "_" + door.id;
            const meshes: BABYLON.AbstractMesh[] = [];
            this.graphics.scene.meshes.forEach((mesh) => {
                if (mesh.name.startsWith(doorName)) {
                    meshes.push(mesh);
                }
            });

            for (const mesh of meshes) {
                const doorInfo = mesh.name.split("_");
                const index = parseInt(doorInfo[2]);
                this.bizdata.removeDoor(door.id, index);

                mesh.dispose();
            }
        },

        /**
         * 修改合页门或滑门的材质或颜色
         * @param doorId 需要修改的door uuid
         * @param newPart
         */
        changeDoorApi(doorId: string, newPart: Part, index: number): void {
            const meshName = ObjectType.DOOR + "_" + doorId + "_" + index;
            const mesh = this.graphics.scene.getMeshByName(meshName);
            if (mesh !== null) {
                const door = this.bizdata.findDoorById(doorId);
                if (
                    door !== undefined &&
                    door.size.x === newPart.width &&
                    door.size.y === newPart.height &&
                    door.size.z === newPart.depth
                ) {
                    const pos = mesh.position.clone();
                    request({
                        url: this.baseOSSUrl + newPart.manifest,
                        method: "GET",
                        responseType: "json",
                    })
                        .then(async (res) => {
                            const newDoor = this.bizdata.changeDoor(doorId, newPart, index);
                            if (newDoor !== undefined) {
                                const itemMf = res.data;
                                const modelIndex = index % itemMf.models.length;
                                const model = itemMf.models[modelIndex];
                                const modelPos = new BABYLON.Vector3(
                                    pos.x + model.position.x,
                                    pos.y + model.position.y,
                                    pos.z + model.position.z,
                                );
                                const modelScaling = new BABYLON.Vector3(
                                    model.scaling.x,
                                    model.scaling.y,
                                    model.scaling.z,
                                );

                                let rootUrl = "file:///";
                                let modelUrl = model.url;
                                const modelFile = await this.loadModelFromDB(modelUrl);
                                if (modelFile === null) {
                                    rootUrl = "";
                                    modelUrl = this.baseOSSUrl + model.url;
                                }

                                const newMeshName = ObjectType.DOOR + "_" + newDoor.id + "_" + index;
                                this.graphics.importMesh(
                                    modelUrl,
                                    newMeshName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    true,
                                    rootUrl,
                                );

                                // clear select item
                                this.clearSelectionApi();
                                // remove the old door.
                                mesh.dispose();
                            }
                        })
                        .catch((err) => {
                            throw Error(`Load part manifest by error: ${err}`);
                        });
                } else {
                    ElMessage({
                        type: "warning",
                        message: "不能更换不同尺寸的门",
                    });
                }
            }
        },

        changeAllDoors(newPart: Part): void {
            this.graphics.scene.meshes.forEach((mesh) => {
                const info = mesh.name.split("_");
                const objectType = info[0];
                const objectId = info[1];
                if (objectType === ObjectType.DOOR) {
                    const door = this.bizdata.findDoorById(objectId);
                    if (
                        door !== undefined &&
                        door.size.x === newPart.width &&
                        door.size.y === newPart.height &&
                        door.size.z === newPart.depth
                    ) {
                        const doorIndex = parseInt(info[2]);
                        this.changeDoorApi(objectId, newPart, doorIndex);
                    }
                }
            });
        },

        /**
         * 批量操作，比如：合页门换滑门（删除合页门，再增加滑门）
         * 备注：操作是有顺序的
         * @param actions 批量操作的列表
         */
        batchActionsApi(
            actions: [
                {
                    method: string; // 与某个api函数名一致，比如："addDoorApi"
                    param: any[]; // api函数的参数列表
                },
            ],
        ): void {
            actions;
        },

        // /**
        //  * 显示多个有效区域（用于添加配件的待选区域）
        //  * @param availableAreas 有效区域的列表
        //  */
        // showAvailableAreaApi(availableAreas: Area[]): void {},

        /**
         * 清空选择中的item
         */
        clearSelectionApi(): void {
            this.graphics.removeCurrentHighlight();

            this.gui.display(this.graphics, this.bizdata as BizData, null);
        },

        /**
         * 设置编辑模式
         * @param mode 编辑模式：
         * 1 - 外观（free camera，内配不能被选择）
         * 2 - 内配（fixed camera，柜体不能被选择）
         * 3 - 浏览模式（free camera，柜体和内配都不能选择）
         */
        setModeApi(mode: number): void {
            this.clearSelectionApi();
            this.clearAvailableAreas();

            this.adjustCamera();

            switch (mode) {
                case 1:
                    {
                        this.graphics.lockCamera(false);

                        this.graphics.scene.rootNodes.forEach((rootNode) => {
                            const rootMesh = rootNode as BABYLON.AbstractMesh;
                            if (rootMesh !== undefined) {
                                const isItem = rootMesh.name.startsWith(ObjectType.ITEM);

                                rootMesh.isVisible = true;
                                rootMesh.getChildMeshes().forEach((childMesh) => {
                                    childMesh.isVisible = true;
                                    childMesh.isPickable = !isItem;

                                    if (isItem && childMesh.getClassName() === "Mesh") {
                                        this.graphics.highlightLayer.addExcludedMesh(childMesh as BABYLON.Mesh);
                                        childMesh.renderingGroupId = 1;
                                        this.graphics.scene.setRenderingAutoClearDepthStencil(1, false, false, false);
                                    }
                                });
                            }
                        });
                    }
                    break;
                case 2:
                    {
                        this.graphics.lockCamera(true);

                        this.graphics.scene.rootNodes.forEach((rootNode) => {
                            const rootMesh = rootNode as BABYLON.AbstractMesh;
                            if (rootMesh !== undefined) {
                                const isCube = rootMesh.name.startsWith(ObjectType.CUBE);
                                const isDoor = rootMesh.name.startsWith(ObjectType.DOOR);
                                const isItem = rootMesh.name.startsWith(ObjectType.ITEM);

                                rootMesh.isVisible = !isDoor;
                                rootMesh.getChildMeshes().forEach((childMesh) => {
                                    childMesh.isVisible = !isDoor;
                                    childMesh.isPickable = !isCube;

                                    if (isItem && childMesh.getClassName() === "Mesh") {
                                        this.graphics.highlightLayer.removeExcludedMesh(childMesh as BABYLON.Mesh);
                                        childMesh.renderingGroupId = 0;
                                    }
                                });
                            }
                        });
                    }
                    break;
                case 3:
                    {
                        this.graphics.lockCamera(false);

                        this.graphics.scene.rootNodes.forEach((rootNode) => {
                            const rootMesh = rootNode as BABYLON.AbstractMesh;
                            if (rootMesh !== undefined) {
                                rootMesh.isVisible = true;
                                rootMesh.getChildMeshes().forEach((childMesh) => {
                                    childMesh.isVisible = true;
                                    childMesh.isPickable = false;
                                });
                            }
                        });
                    }
                    break;
            }
        },

        setDefaultCamera() {
            this.graphics.setCameraPosition(0, 1.75, this.bizdata.totalWidth * 1.5);
        },

        setCameraAlpha(alpha: number) {
            const radius = this.bizdata.totalWidth * 0.75;
            const x = radius * Math.tanh(alpha);
            const y = radius * Math.tan(alpha);
            this.graphics.setCameraPosition(-x, 1.75, y);
        },

        adjustCamera() {
            const cameraPosX = (this.bizdata.startX + this.bizdata.endX) * 0.5;

            let cameraHeight = this.bizdata.totalHeight * 0.45;
            if (this.mode === 3) cameraHeight = this.bizdata.totalHeight * 0.55;

            let viewDistance = Math.max(this.bizdata.totalWidth, this.bizdata.totalHeight);
            if (viewDistance < 3) viewDistance *= 1.8;
            else viewDistance *= 1.3;

            this.graphics.setCameraPosition(cameraPosX, cameraHeight, viewDistance);
            this.graphics.setCameraTarget(cameraPosX, cameraHeight, 0);
        },

        /**
         * 获得当前被选中的物件（可能存在多选）
         * @result 返回当前被选中items的uuid
         */
        getSelectedItemsApi(): string[] {
            return [];
        },

        /**
         * 选择items
         * 备注：在全选或者多选模式下使用
         * @param itemIds 需要被选择item的uuid列表
         */
        selectItemsApi(itemIds: string[]): void {
            itemIds;
        },

        /**
         * 清空所有的内配
         */
        clearItemsApi(): void {},

        handleGraphicsEvent(graphics: Graphics) {
            graphics.eventDispatcher.on(GraphicsEvent.EXTERNAL_EVENT_OBJECT_ONSELECTED, (data: any) => {
                // console.log("Object selected: ", data.name);

                const info = data.name.split("_");
                const objectType = info[0];
                const id = info[1];
                switch (objectType) {
                    case ObjectType.CUBE:
                        {
                            const cube = this.bizdata.findCubeById(id);
                            if (cube !== undefined && cube.catId !== null) {
                                const objectSelectedEvent = new event.ObjectSelectedEvent(
                                    cube.catId,
                                    cube.partId,
                                    cube,
                                );
                                this.eventEmit(objectSelectedEvent);
                            }
                        }
                        break;
                    case ObjectType.ITEM:
                        {
                            const item = this.bizdata.findItemById(id);
                            if (item !== undefined && item.catId !== null) {
                                const objectSelectedEvent = new event.ObjectSelectedEvent(
                                    item.catId,
                                    item.partId,
                                    item,
                                );
                                this.eventEmit(objectSelectedEvent);
                            }
                        }
                        break;
                    case ObjectType.DOOR:
                        {
                            const door = this.bizdata.findDoorById(id);
                            if (door !== undefined && door.catId !== null) {
                                const objectSelectedEvent = new event.ObjectSelectedEvent(
                                    door.catId,
                                    door.partId,
                                    door,
                                );
                                this.eventEmit(objectSelectedEvent);
                            }
                        }
                        break;
                }
            });

            graphics.eventDispatcher.on(GraphicsEvent.EXTERNAL_EVENT_OBJECT_ONUNSELECTED, (data: any) => {
                // console.log("Object unselected: ", data.name);

                const info = data.name.split("_");
                // const objectType = info[0];
                const id = info[1];
                switch (info[0]) {
                    case ObjectType.CUBE:
                        {
                            const cube = this.bizdata.findCubeById(id);
                            if (cube !== undefined && cube.catId !== null) {
                                const objectUnselectedEvent = new event.ObjectUnselectedEvent(
                                    cube.catId,
                                    cube.partId,
                                    cube,
                                );
                                this.eventEmit(objectUnselectedEvent);
                            }
                        }
                        break;
                    case ObjectType.ITEM:
                        {
                            const item = this.bizdata.findItemById(id);
                            if (item !== undefined && item.catId !== null) {
                                const objectUnselectedEvent = new event.ObjectUnselectedEvent(
                                    item.catId,
                                    item.partId,
                                    item,
                                );
                                this.eventEmit(objectUnselectedEvent);
                            }
                        }
                        break;
                    case ObjectType.DOOR:
                        {
                            const door = this.bizdata.findDoorById(id);
                            if (door !== undefined && door.catId !== null) {
                                const objectUnselectedEvent = new event.ObjectUnselectedEvent(
                                    door.catId,
                                    door.partId,
                                    door,
                                );
                                this.eventEmit(objectUnselectedEvent);
                            }
                        }
                        break;
                }
            });
        },

        loadScheme(schemeType = 0) {
            this.loadedModelCount = 0;
            this.schemeModelCount = 0;
            this.bizdata.totalWidth = 0;

            // TODO: load background.

            let firstCubeId = "";
            switch (schemeType) {
                case 0:
                    {
                        this.scheme.manifest.cubes.forEach((cube: Cube) => {
                            this.bizdata.totalWidth += cube.size.x;
                            if (cube.size.y > this.bizdata.totalHeight) this.bizdata.totalHeight = cube.size.y;
                            if (cube.size.z > this.bizdata.totalDepth) this.bizdata.totalDepth = cube.size.z;
                        });
                    }
                    break;
                case 1: {
                    const cube = this.scheme.manifest.cubes[0];
                    this.bizdata.totalWidth = cube.size.x;
                    this.bizdata.totalHeight = cube.size.y;
                    this.bizdata.totalDepth = cube.size.z;
                    firstCubeId = cube.id;
                }
            }

            let startX = this.bizdata.totalWidth * 0.5;
            this.bizdata.startX = startX;
            this.bizdata.endX = -startX;
            this.adjustCamera();

            this.scheme.manifest.cubes.forEach((cube: Cube) => {
                let cubeOriginX = 0;
                if (this.schemeType === 0) {
                    cubeOriginX = startX - cube.size.x * 0.5;
                    startX -= cube.size.x;
                }

                const cubeOrigin = new BABYLON.Vector3(cubeOriginX, 0, 0);
                this.bizdata.cubeMap.set(cube.id, {
                    origin: cubeOrigin,
                    width: cube.size.x,
                    height: cube.size.y,
                    depth: cube.size.z,
                });

                request({
                    url: this.baseOSSUrl + cube.manifest,
                    method: "GET",
                    responseType: "json",
                })
                    .then((res) => {
                        const cubeMf = res.data;
                        this.schemeModelCount += cubeMf.models.length;

                        cubeMf.models.forEach(async (model: any) => {
                            const modelPos = new BABYLON.Vector3(
                                cubeOrigin.x + model.position.x,
                                cubeOrigin.y + model.position.y,
                                cubeOrigin.z + model.position.z,
                            );
                            const modelScaling = new BABYLON.Vector3(model.scaling.x, model.scaling.y, model.scaling.z);
                            const cubeName = ObjectType.CUBE + "_" + cube.id;

                            let rootUrl = "file:///";
                            let modelUrl = model.url;
                            const modelFile = await this.loadModelFromDB(modelUrl);
                            if (modelFile === null) {
                                rootUrl = "";
                                modelUrl = this.baseOSSUrl + model.url;
                            }

                            this.graphics
                                .importMesh(
                                    modelUrl,
                                    cubeName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    false,
                                    rootUrl,
                                )
                                .then((mesh) => {
                                    if (schemeType === 1) {
                                        const firstCubeName = ObjectType.CUBE + "_" + firstCubeId;
                                        if (mesh !== null && mesh.name !== firstCubeName) {
                                            mesh.getChildMeshes().forEach((childMesh) => {
                                                childMesh.isVisible = false;
                                            });
                                        }
                                    }
                                    if (++this.loadedModelCount >= this.schemeModelCount) this.loadSchemeCompleted();
                                });
                        });

                        cube.items.forEach((item: Item) => {
                            if (item.location !== null) {
                                switch (item.location.locationType) {
                                    case 1: // 中间位置（抽屉、隔板、挂衣杆等）
                                        {
                                            const startPos = item.location.startPos;
                                            if (startPos !== null) {
                                                const itemOrigin = new BABYLON.Vector3(
                                                    cubeOrigin.x - startPos.x,
                                                    cubeOrigin.y + startPos.y,
                                                    cubeOrigin.z + startPos.z,
                                                );

                                                request({
                                                    url: this.baseOSSUrl + item.manifest,
                                                    method: "GET",
                                                    responseType: "json",
                                                })
                                                    .then((res) => {
                                                        const itemMf = res.data;
                                                        this.schemeModelCount += itemMf.models.length;

                                                        itemMf.models.forEach(async (model: any) => {
                                                            const modelPos = new BABYLON.Vector3(
                                                                itemOrigin.x + model.position.x,
                                                                itemOrigin.y + model.position.y,
                                                                itemOrigin.z + model.position.z,
                                                            );
                                                            const modelScaling = new BABYLON.Vector3(
                                                                model.scaling.x,
                                                                model.scaling.y,
                                                                model.scaling.z,
                                                            );
                                                            const itemName = ObjectType.ITEM + "_" + item.id;

                                                            let rootUrl = "file:///";
                                                            let modelUrl = model.url;
                                                            const modelFile = await this.loadModelFromDB(modelUrl);
                                                            if (modelFile === null) {
                                                                rootUrl = "";
                                                                modelUrl = this.baseOSSUrl + model.url;
                                                            }
                                                            this.graphics
                                                                .importMesh(
                                                                    modelUrl,
                                                                    itemName,
                                                                    modelPos,
                                                                    BABYLON.Vector3.Zero(),
                                                                    modelScaling,
                                                                    false,
                                                                    rootUrl,
                                                                )
                                                                .then((mesh) => {
                                                                    if (schemeType === 1) {
                                                                        if (mesh !== null && cube.id !== firstCubeId) {
                                                                            mesh.getChildMeshes().forEach(
                                                                                (childMesh) => {
                                                                                    childMesh.isVisible = false;
                                                                                },
                                                                            );
                                                                        }
                                                                    }

                                                                    if (
                                                                        ++this.loadedModelCount >= this.schemeModelCount
                                                                    )
                                                                        this.loadSchemeCompleted();
                                                                });
                                                        });
                                                    })
                                                    .catch((err) => {
                                                        throw Error(`Load part manifest by error: ${err}`);
                                                    });
                                            }
                                        }
                                        break;
                                    case 2: // 两侧位置（镜子）
                                        // TODO:
                                        break;
                                    case 3: // 基于其他part的相对位置
                                        // TODO:
                                        break;
                                }
                            }
                        });
                    })
                    .catch((err) => {
                        throw Error(`Load cube manifest by error: ${err}`);
                    });
            });

            this.scheme.manifest.doors.forEach((door: Door) => {
                this.addDoorApi(door, false, true);
            });
        },

        /**
         * product-detail.vue 从oss重新读取了scheme，此时scheme已经发生变化，需要reload
         */
        reloadScheme() {
            // Remove 3D reference ruler firstly.
            this.showReferenceRuler(false);

            // Clear old scene.
            this.graphics.clearScene();

            // Recreate the bizdata.
            this.bizdata = new BizData(this.scheme);
            // Reload the old scheme which is updated in product-detail.vue.
            this.loadScheme();

            // Re-enable 3D reference ruler.
            this.showReferenceRuler(true);
        },

        loadSchemeCompleted() {
            const e = new event.SchemeLoadCompletedEvent();
            this.eventEmit(e);
        },

        ShowAvailableArea(part: Part, areaHints: AreaHints): void {
            this.clearSelectionApi();
            this.clearAvailableAreas();

            for (let i = 0; i < areaHints.cubeHints.length; i++) {
                const cubeHint = areaHints.cubeHints[i];
                for (let j = 0; j < cubeHint.areas.length; j++) {
                    const area = cubeHint.areas[j];
                    const cubeData = this.bizdata.cubeMap.get(area.cubeId);
                    if (cubeData !== undefined) {
                        const width = area.endPoint.x - area.startPoint.x;
                        const height = area.endPoint.y - area.startPoint.y;
                        const depth = area.endPoint.z - area.startPoint.z;
                        const availableArea = BABYLON.MeshBuilder.CreateBox(
                            `BackgroundArea_${area.cubeId}_${i.toString()}_${j.toString()}`,
                            { width: width, height: height, depth: depth },
                            this.graphics.scene as BABYLON.Scene,
                        );
                        const areaMat = new BABYLON.StandardMaterial(
                            "AvailableArea",
                            this.graphics.scene as BABYLON.Scene,
                        );

                        areaMat.emissiveColor = new BABYLON.Color3(45 / 255, 186 / 255, 236 / 255);
                        areaMat.alpha = 0.25;
                        availableArea.material = areaMat;

                        availableArea.position = new BABYLON.Vector3(
                            cubeData.origin.x + (area.endPoint.x + area.startPoint.x) * 0.5,
                            cubeData.origin.y + (area.endPoint.y + area.startPoint.y) * 0.5,
                            cubeData.origin.z + (area.endPoint.z + area.startPoint.z) * 0.5,
                        );

                        availableArea.enableEdgesRendering();
                        availableArea.edgesWidth = 0.5 * this.bizdata.SceneUnit;
                        availableArea.edgesColor = new BABYLON.Color4(1, 1, 1, 1);
                        this.graphics.disableLightEffect(availableArea);
                        this.availableAreas.push(availableArea);
                    }
                }
            }
        },

        ShowCubeAddArea(part: Part): void {
            this.clearAvailableAreas();

            const width = part.width;
            const height = part.height;
            const depth = part.depth;
            const cubeArea1 = BABYLON.MeshBuilder.CreateBox(
                `BackgroundArea_StartCube_${part.id.toString()}`,
                { width: width, height: height, depth: depth },
                this.graphics.scene as BABYLON.Scene,
            );
            const areaMat = new BABYLON.StandardMaterial("AvailableArea", this.graphics.scene as BABYLON.Scene);

            areaMat.emissiveColor = new BABYLON.Color3(45 / 255, 186 / 255, 236 / 255);
            areaMat.alpha = 0.5;
            cubeArea1.material = areaMat;

            cubeArea1.position = new BABYLON.Vector3(this.bizdata.startX + width * 0.5, height * 0.5, 0);

            cubeArea1.enableEdgesRendering();
            cubeArea1.edgesWidth = 0.5 * this.bizdata.SceneUnit;
            cubeArea1.edgesColor = new BABYLON.Color4(1, 1, 1, 1);
            this.graphics.disableLightEffect(cubeArea1);
            this.availableAreas.push(cubeArea1);

            const cubeArea2 = cubeArea1.clone();
            cubeArea2.name = `BackgroundArea_EndCube_${part.id.toString()}`;
            cubeArea2.position = new BABYLON.Vector3(this.bizdata.endX - width * 0.5, height * 0.5, 0);
            cubeArea2.enableEdgesRendering();
            cubeArea2.edgesWidth = 0.5 * this.bizdata.SceneUnit;
            cubeArea2.edgesColor = new BABYLON.Color4(1, 1, 1, 1);
            this.graphics.disableLightEffect(cubeArea2);
            this.availableAreas.push(cubeArea2);
        },

        getAvailableAreaByPart(part: Part): Area[] {
            const biz: BizData = this.bizdata as BizData;
            return drobeUtil.getAvailableAreaByPart(biz, part);
        },

        clearAvailableAreas(): void {
            if (this.availableAreas === undefined) return;

            this.availableAreas.forEach((area) => {
                area.dispose();
            });
            this.availableAreas.length = 0;
        },

        setupInteraction() {
            this.graphics.scene.onPointerObservable.add((pointerInfo: BABYLON.PointerInfo) => {
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        if (pointerInfo && pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
                            const rootMesh = this.graphics.getRootMesh(pointerInfo.pickInfo.pickedMesh);
                            if (rootMesh === null) return;

                            const meshName = rootMesh.name;
                            const info = meshName.split("_");
                            const objectType = info[0];

                            // Compute the movement min max
                            let min = -1;
                            let max = -1;
                            if (objectType === ObjectType.ITEM) {
                                const itemId = info[1];
                                const cubeItem = this.bizdata.findCubeItemByItemId(itemId);
                                if (cubeItem.cube !== undefined && cubeItem.item !== undefined) {
                                    const scope = this.stl.computeMovementScope(cubeItem.cube, cubeItem.item);
                                    min = scope.intervalsY[0].min;
                                    max = scope.intervalsY[0].max;
                                }
                            }
                            this.gui.display(this.graphics, this.bizdata as BizData, rootMesh, min, max);

                            if (objectType === "BackgroundArea") {
                                // Hit the available area.
                                const cubeId = info[1];
                                const manifest = this.newPart.manifest;

                                if (cubeId === "StartCube" || cubeId === "EndCube") {
                                    request({
                                        url: this.baseOSSUrl + manifest,
                                        method: "GET",
                                        responseType: "json",
                                    })
                                        .then((res) => {
                                            const addToLeft = cubeId === "StartCube";
                                            const cubeMf = res.data;
                                            const cubeUUID = uuidv4();
                                            const originX = addToLeft
                                                ? this.bizdata.startX + this.newPart.width * 0.5
                                                : this.bizdata.endX - this.newPart.width * 0.5;
                                            const itemOrigin = new BABYLON.Vector3(originX, 0, 0);

                                            // TODO: create a parent mesh to contain all import meshes.
                                            cubeMf.models.forEach(async (model: any) => {
                                                const modelPos = new BABYLON.Vector3(
                                                    itemOrigin.x + model.position.x,
                                                    itemOrigin.y + model.position.y,
                                                    itemOrigin.z + model.position.z,
                                                );
                                                const modelScaling = new BABYLON.Vector3(
                                                    model.scaling.x,
                                                    model.scaling.y,
                                                    model.scaling.z,
                                                );
                                                const itemName = ObjectType.CUBE + "_" + cubeUUID;

                                                let rootUrl = "file:///";
                                                let modelUrl = model.url;
                                                const modelFile = await this.loadModelFromDB(modelUrl);
                                                if (modelFile === null) {
                                                    rootUrl = "";
                                                    modelUrl = this.baseOSSUrl + model.url;
                                                }
                                                this.graphics.importMesh(
                                                    modelUrl,
                                                    itemName,
                                                    modelPos,
                                                    BABYLON.Vector3.Zero(),
                                                    modelScaling,
                                                    true,
                                                    rootUrl,
                                                );
                                            });

                                            const partId = this.newPart.id;
                                            const catId = this.newPart.catId;
                                            const size = new Size(
                                                this.newPart.width,
                                                this.newPart.height,
                                                this.newPart.depth,
                                            );

                                            const items: Item[] = [];
                                            const newCube = new Cube(cubeUUID, partId, manifest, catId, size, items);
                                            this.bizdata.addCube(newCube, addToLeft);
                                        })
                                        .catch(() => {
                                            throw Error(`Require manifest by error: ${manifest}`);
                                        });
                                } else {
                                    const cubeData = this.bizdata.cubeMap.get(cubeId);
                                    if (
                                        cubeData !== undefined &&
                                        manifest !== undefined &&
                                        pointerInfo.pickInfo.pickedPoint !== null
                                    ) {
                                        // const pickedPointY = pointerInfo.pickInfo.pickedPoint.y;

                                        request({
                                            url: this.baseOSSUrl + manifest,
                                            method: "GET",
                                            responseType: "json",
                                        })
                                            .then((res) => {
                                                const itemMf = res.data;
                                                const itemId = uuidv4();
                                                // const startPos = new BABYLON.Vector3(
                                                //     0,
                                                //     pickedPointY - itemMf.size.y * 0.5,
                                                //     0,
                                                // );

                                                const size = new Size(
                                                    this.newPart.width,
                                                    this.newPart.height,
                                                    this.newPart.depth,
                                                );

                                                const cubeHintIdx = parseInt(info[2]);
                                                const areaIdx = parseInt(info[3]);
                                                const anchorMeta: AnchorMeta = this.stl.computeAnchorMeta(
                                                    this.areaHints.cubeHints[cubeHintIdx].areas[areaIdx],
                                                    this.defaultPartType,
                                                    size,
                                                );

                                                const itemOrigin = new BABYLON.Vector3(
                                                    cubeData.origin.x + anchorMeta.pivot.x,
                                                    cubeData.origin.y + anchorMeta.pivot.y,
                                                    cubeData.origin.z + anchorMeta.pivot.z,
                                                );

                                                // TODO: create a parent mesh to contain all import meshes.
                                                itemMf.models.forEach(async (model: any) => {
                                                    const modelPos = new BABYLON.Vector3(
                                                        itemOrigin.x + model.position.x,
                                                        itemOrigin.y + model.position.y,
                                                        itemOrigin.z + model.position.z,
                                                    );
                                                    const modelScaling = new BABYLON.Vector3(
                                                        model.scaling.x,
                                                        model.scaling.y,
                                                        model.scaling.z,
                                                    );
                                                    const itemName = ObjectType.ITEM + "_" + itemId;

                                                    let rootUrl = "file:///";
                                                    let modelUrl = model.url;
                                                    const modelFile = await this.loadModelFromDB(modelUrl);
                                                    if (modelFile === null) {
                                                        rootUrl = "";
                                                        modelUrl = this.baseOSSUrl + model.url;
                                                    }
                                                    this.graphics.importMesh(
                                                        modelUrl,
                                                        itemName,
                                                        modelPos,
                                                        BABYLON.Vector3.Zero(),
                                                        modelScaling,
                                                        true,
                                                        rootUrl,
                                                    );
                                                });

                                                const partId = this.newPart.id;
                                                const catId = this.newPart.catId;
                                                const attachment: Array<PartCount> = [];
                                                this.newPart.attachments.forEach((item) => {
                                                    const partCount = new PartCount(item.apcmid, item.count);
                                                    attachment.push(partCount);
                                                });

                                                // TODO: only handle the case of locationType==1.
                                                const location = new Location(1, anchorMeta.pivot, null);
                                                const newItem = new Item(
                                                    itemId,
                                                    partId,
                                                    manifest,
                                                    catId,
                                                    size,
                                                    attachment,
                                                    location,
                                                );
                                                this.bizdata.addItem(newItem, cubeId);
                                            })
                                            .catch(() => {
                                                throw Error(`Require manifest by error: ${manifest}`);
                                            });
                                    }
                                }
                            }

                            this.clearAvailableAreas();
                        } else {
                            this.gui.display(this.graphics, this.bizdata as BizData, null);
                            this.clearAvailableAreas();
                        }
                        break;
                }
            });
        },

        setupKeyboard(): void {
            this.graphics.scene.onKeyboardObservable.add((kbInfo: BABYLON.KeyboardInfo) => {
                switch (kbInfo.type) {
                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                        // console.log("KEY DOWN: ", kbInfo.event.key)
                        switch (kbInfo.event.key) {
                            case "5":
                                console.log("Log Scheme: ", this.scheme);
                                console.log("Log Scene: ", this.graphics.scene);
                                break;
                            case "6":
                                // this.adjustCamera();
                                this.showDoors(true);
                                break;
                            case "7":
                                // Add test codes:
                                // this.screenshotApi().then((data) => {
                                //     console.log(data);
                                // });
                                // this.switchCube(1);
                                this.showDoors(false);
                                break;
                        }
                        break;
                    case BABYLON.KeyboardEventTypes.KEYUP:
                        break;
                }
            });
        },

        setupWallandFloor(): void {
            // Floor
            this.floor = BABYLON.MeshBuilder.CreateBox(
                "Background_Floor",
                { width: 5.0, height: 0.01, depth: 2.0 },
                this.graphics.scene as BABYLON.Scene,
            );
            this.floor.position = new BABYLON.Vector3(0, 0, 0.7);
            var floor_material = new BABYLON.StandardMaterial("floorMaterial", this.graphics.scene as BABYLON.Scene);
            const texture = new BABYLON.Texture(
                "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/floor/cc720923-b9d4-4ad1-af1e-db98151cacec.jpg",
                this.graphics.scene as BABYLON.Scene,
            );
            texture.uScale = 2;
            texture.vScale = 2;
            floor_material.diffuseTexture = texture;
            this.floor.material = floor_material;
            this.floor.isPickable = false;
            this.floor.receiveShadows = true;
            // Wall
            this.wall = BABYLON.MeshBuilder.CreateBox(
                "Background_Wall",
                { width: 5.0, height: 3.0, depth: 0.01 },
                this.graphics.scene as BABYLON.Scene,
            );
            this.wall.position = new BABYLON.Vector3(0, 1.5, -0.31);
            var wall_material = new BABYLON.StandardMaterial("groundMaterial", this.graphics.scene as BABYLON.Scene);
            wall_material.diffuseTexture = new BABYLON.Texture(
                "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/wall/5214664c-4422-4c84-8f2b-7fa1e9c67426.jpg",
                this.graphics.scene as BABYLON.Scene,
            );
            this.wall.material = wall_material;
            this.wall.isPickable = false;
            this.wall.receiveShadows = true;
        },

        showReferenceRuler(showRuler: boolean): void {
            const { height, width, depth } = this.size;
            this.gui.showRuler(this.graphics, this.bizdata as BizData, showRuler, height, width, depth);
        },

        async screenshotApi(size = { width: 800, height: 600 }): Promise<string> {
            const rulerDisplayed = this.gui.rulerDisplayed;
            if (rulerDisplayed) this.showReferenceRuler(false);

            // Display all objects, including door.
            this.graphics.scene.meshes.forEach((mesh) => {
                mesh.isVisible = true;
            });

            this.adjustCamera();

            // Method 1:
            // const ret = await this.graphics.createScreenshotAsync(size);

            // Method 2: cannot render font.
            const ret = await this.graphics.createScreenshotUsingRenderTargetAsync(size, 8, false);

            if (rulerDisplayed) this.showReferenceRuler(true);
            return ret;
        },

        async loadModelFromDB(key: string): Promise<File | null> {
            const value = await this.indexDb.get<DBValue>(key);
            if (value != null && value.file != null) {
                BABYLON.FilesInputStore.FilesToLoad[key] = value.file as File;
                return value.file;
            } else {
                return null;
            }
        },

        showDoors(isVisible: boolean): void {
            this.graphics.scene.rootNodes.forEach((rootNode) => {
                const rootMesh = rootNode as BABYLON.AbstractMesh;
                if (rootMesh !== undefined) {
                    const isDoor = rootMesh.name.startsWith(ObjectType.DOOR);
                    if (isDoor) {
                        rootMesh.isVisible = isVisible;
                        rootMesh.getChildMeshes().forEach((childMesh) => {
                            childMesh.isVisible = isVisible;
                        });
                    }
                }
            });
        },

        switchCube(index: number): void {
            if (this.schemeType !== 1) return;

            let i = 0;
            this.scheme.manifest.cubes.forEach((cube) => {
                const isVisible = i === index;
                const cubeMeshName = ObjectType.CUBE + "_" + cube.id;
                const cubeMesh = this.graphics.getMeshByName(cubeMeshName);
                if (cubeMesh !== null) {
                    cubeMesh.isVisible = isVisible;
                    cubeMesh.getChildMeshes().forEach((childMesh) => {
                        childMesh.isVisible = isVisible;
                    });
                }

                cube.items.forEach((item) => {
                    const itemMeshName = ObjectType.ITEM + "_" + item.id;
                    const itemMesh = this.graphics.getMeshByName(itemMeshName);
                    if (itemMesh !== null) {
                        itemMesh.isVisible = isVisible;
                        itemMesh.getChildMeshes().forEach((childMesh) => {
                            childMesh.isVisible = isVisible;
                        });
                    }
                });

                i++;
            });
        },
    },
});
</script>

<style scoped lang="scss">
#canvas {
    width: 100%;
    height: 100%;
}
</style>
