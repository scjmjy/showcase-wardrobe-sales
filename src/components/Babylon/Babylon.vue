<template>
    <div>
        <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import * as BABYLON from "babylonjs";
import { Graphics, GraphicsEvent } from "@/lib/graphics";
import { Scheme, Cube, Item, Door, PartType, Position, Location, Area, Size } from "@/lib/scheme";
import * as util from "@/lib/scheme.util";
import { BizData, ObjectType } from "@/lib/biz.data";
import { v4 as uuidv4 } from "uuid";
import request from "@/utils/request";
import { drobeUtil } from "@/lib/drobe.util";
import * as event from "@/lib/biz.event";
import { PopupGUI } from "@/lib/hm_gui";
import { ElMessage } from "element-plus";

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
        scheme: {
            type: Scheme,
            default: null,
        },
        baseOSSUrl: {
            type: String,
            default: "",
        },
        selectedPart: {
            type: Object as PropType<PartType>,
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
            newPart: {} as PartType,
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
            handler(newPart: PartType) {
                if (newPart.id !== undefined) {
                    console.log("[Watch selectedPart] ", newPart);
                    this.newPart = newPart;

                    if (this.graphics.currentMesh !== null) {
                        const info = this.graphics.currentMesh.name.split("_");
                        const objectType = info[0];
                        const objectId = info[1];
                        switch (objectType) {
                            case ObjectType.CUBE:
                                this.changeCubeApi(objectId, newPart);
                                break;
                            case ObjectType.DOOR:
                                break;
                            case ObjectType.ITEM:
                                this.changeItemApi(objectId, newPart);
                                break;
                        }
                    } else {
                        // TODO: remove the hardcode of adjusting whether it is a cube.
                        if (newPart.catId !== 20) {
                            const availableArea = this.getAvailableAreaByPart(newPart);
                            this.ShowAvailableArea(newPart, availableArea);
                        } else {
                            // TODO: remove the function of adding new cube.
                            this.ShowCubeAddArea(newPart);
                            // Change all cubes if no cube is selected.
                            this.changeAllCubes(newPart);
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
        this.bizdata = new BizData(this.scheme);

        // set the scene size as 7.5m.
        this.graphics.init(7.5 * this.bizdata.SceneUnit);
        this.graphics.render();

        this.setupInteraction();
        this.setupKeyboard();
        this.handleGraphicsEvent(this.graphics);

        this.setupWallandFloor();
        this.loadScheme();
    },
    methods: {
        /**
         * 修改墙面
         * @param newPartId
         */
        changeWallApi(newPartId: number): void {
            const wall_material = new BABYLON.StandardMaterial("WallMaterial", this.graphics.scene as BABYLON.Scene);
            wall_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            const temp = this.bizdata.partManifestMap.get(newPartId.toString());
            const texture = new BABYLON.Texture(String(temp), this.graphics.scene as BABYLON.Scene);
            texture.uScale = 1;
            texture.vScale = 1;
            wall_material.diffuseTexture = texture;
            this.wall.material = wall_material;
        },

        /**
         * 修改地板
         * @param newPartId
         */
        changeFloorApi(newPartId: number): void {
            const floor_material = new BABYLON.StandardMaterial("floorMaterial", this.graphics.scene as BABYLON.Scene);
            floor_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            const temp = this.bizdata.partManifestMap.get(newPartId.toString());
            const texture = new BABYLON.Texture(String(temp), this.graphics.scene as BABYLON.Scene);
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
        changeCubeApi(cubeId: string, newPart: PartType): void {
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
                            itemMf.models.forEach((model: any) => {
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
                                const modelUrl = this.baseOSSUrl + model.url;
                                this.graphics.importMesh(
                                    modelUrl,
                                    meshName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    true,
                                );
                            });

                            // clear select item
                            this.clearSelectionApi();
                            // remove the old item
                            mesh.dispose();
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

        changeAllCubes(newPart: PartType): void {
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

        /**
         * 增加一个item
         * @param newItem 增加的Item
         */
        addItemApi(newItem: Item): void {},

        /**
         * 移除多个items
         * @param itemIds 被移除item的uuid列表
         */
        removeItemsApi(itemIds: string[]): void {},

        /**
         * 修改配件的材质或颜色
         * @param itemId 需要修改的item id
         * @param newPartId 修改后配件对应的part
         */
        changeItemApi(itemId: string, newPart: PartType): void {
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
                            itemMf.models.forEach((model: any) => {
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
                                const modelUrl = this.baseOSSUrl + model.url;
                                this.graphics.importMesh(
                                    modelUrl,
                                    meshName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    true,
                                );
                            });

                            // clear select item
                            this.clearSelectionApi();
                            // remove the old item
                            mesh.dispose();
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
         * 增加一个合页门或者滑门
         * @param newDoor 新增加的Door
         */
        addDoorApi(newDoor: Door): void {
            request({
                url: this.baseOSSUrl + newDoor.manifest,
                method: "GET",
                responseType: "json",
            })
                .then((res) => {
                    let cubesWidth = 0;
                    newDoor.cubes.forEach((cubeId: string) => {
                        const cube = this.bizdata.findCubeById(cubeId);
                        if (cube !== undefined) {
                            cubesWidth += cube.size.x;
                        }
                    });

                    const itemMf = res.data;
                    const doorWidth = itemMf.size.x;
                    const doorNum = Math.floor(cubesWidth / doorWidth);
                    const firstCubeData = this.bizdata.findCubeDataById(newDoor.cubes[0]);
                    if (firstCubeData === undefined) {
                        throw Error(`cannot find cube data by id: ${newDoor.cubes[0]}`);
                    } else {
                        let startX = firstCubeData.origin.x + firstCubeData.width * 0.5;
                        for (let i = 0; i < doorNum; i += itemMf.models.length) {
                            let doorIndex = 0;
                            itemMf.models.forEach((model: any) => {
                                const modelPos = new BABYLON.Vector3(
                                    startX - doorWidth * 0.5 + model.position.x,
                                    0.03 + model.position.y,
                                    firstCubeData.depth * 0.5 + model.position.z,
                                );
                                const modelScaling = new BABYLON.Vector3(
                                    model.scaling.x,
                                    model.scaling.y,
                                    model.scaling.z,
                                );
                                const doorName = ObjectType.DOOR + "_" + newDoor.id + "_" + doorIndex;
                                const modelUrl = this.baseOSSUrl + model.url;
                                this.graphics.importMesh(
                                    modelUrl,
                                    doorName,
                                    modelPos,
                                    BABYLON.Vector3.Zero(),
                                    modelScaling,
                                    true,
                                );

                                startX -= doorWidth;
                                doorIndex++;
                            });
                        }
                    }
                })
                .catch((err) => {
                    throw Error(`Load part manifest by error: ${err}`);
                });
        },

        /**
         * 移除合页门或者滑门
         * @param doorIds 被移除门的uuid列表
         */
        removeDoorsApi(doorIds?: string[]): void {
            drobeUtil.removeDoors(this.graphics, this.bizdata as BizData, doorIds);
        },

        /**
         * 修改合页门或滑门的材质或颜色
         * @param doorId 需要修改的door uuid
         * @param newPartId
         */
        changeDoorApi(doorId: string, newPartId: number, newManifest: string): void {},

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
        ): void {},

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

            switch (mode) {
                case 1:
                    {
                        // SS TODO: remove the hardcode below.
                        if (this.bizdata.totalWidth <= 2.85) this.graphics.setCameraPosition(0, 1.75, 4.5);
                        else this.graphics.setCameraPosition(0, 1.75, this.bizdata.totalWidth * 1.5);
                        this.graphics.lockCamera(false);

                        this.graphics.scene.meshes.forEach((mesh) => {
                            const isItem = mesh.name.startsWith(ObjectType.ITEM);

                            mesh.isVisible = true;
                            mesh.getChildMeshes().forEach((childMesh) => {
                                childMesh.isPickable = !isItem;
                            });

                            if (isItem) {
                                mesh.getChildMeshes().forEach((childMesh) => {
                                    if (childMesh.getClassName() === "Mesh") {
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
                        // SS TODO: remove the hardcode below.
                        if (this.bizdata.totalWidth <= 2.85) this.graphics.setCameraPosition(0, 1.75, 4.5);
                        else this.graphics.setCameraPosition(0, 1.75, this.bizdata.totalWidth * 1.5);
                        this.graphics.lockCamera(true);

                        this.graphics.scene.meshes.forEach((mesh) => {
                            const isCube = mesh.name.startsWith(ObjectType.CUBE);
                            const isDoor = mesh.name.startsWith(ObjectType.DOOR);
                            const isItem = mesh.name.startsWith(ObjectType.ITEM);

                            mesh.isVisible = !isDoor;
                            mesh.getChildMeshes().forEach((childMesh) => {
                                childMesh.isPickable = !isCube;
                            });

                            if (isItem) {
                                mesh.getChildMeshes().forEach((childMesh) => {
                                    if (childMesh.getClassName() === "Mesh") {
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
                        // SS TODO: remove the hardcode below.
                        this.graphics.setCameraPosition(0, 1.1, 6);
                        this.graphics.lockCamera(false);

                        this.graphics.scene.meshes.forEach((mesh) => {
                            mesh.isVisible = true;
                            mesh.getChildMeshes().forEach((childMesh) => {
                                childMesh.isPickable = false;
                            });
                        });
                    }
                    break;
            }
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
        selectItemsApi(itemIds: string[]): void {},

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
                const objectType = info[0];
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

        loadScheme() {
            // TODO: load background.

            this.scheme.cubes.forEach((cube: Cube) => {
                this.bizdata.totalWidth += cube.size.x;
                if (cube.size.y > this.bizdata.totalHeight) this.bizdata.totalHeight = cube.size.y;
                if (cube.size.z > this.bizdata.totalDepth) this.bizdata.totalDepth = cube.size.z;
            });

            let startX = this.bizdata.totalWidth * 0.5;
            this.bizdata.startX = startX;
            this.bizdata.endX = -startX;
            this.scheme.cubes.forEach((cube: Cube) => {
                const cubeOriginX = startX - cube.size.x * 0.5;
                startX -= cube.size.x;

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

                        cubeMf.models.forEach((model: any) => {
                            const modelPos = new BABYLON.Vector3(
                                cubeOrigin.x + model.position.x,
                                cubeOrigin.y + model.position.y,
                                cubeOrigin.z + model.position.z,
                            );
                            const modelScaling = new BABYLON.Vector3(model.scaling.x, model.scaling.y, model.scaling.z);
                            const cubeName = ObjectType.CUBE + "_" + cube.id;
                            const modelUrl = this.baseOSSUrl + model.url;
                            this.graphics.importMesh(
                                modelUrl,
                                cubeName,
                                modelPos,
                                BABYLON.Vector3.Zero(),
                                modelScaling,
                                false,
                            );
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
                                                        itemMf.models.forEach((model: any) => {
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
                                                            const modelUrl = this.baseOSSUrl + model.url;
                                                            this.graphics.importMesh(
                                                                modelUrl,
                                                                itemName,
                                                                modelPos,
                                                                BABYLON.Vector3.Zero(),
                                                                modelScaling,
                                                                false,
                                                            );
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

            this.scheme.doors.forEach((door: Door) => {
                this.addDoorApi(door);
            });
        },

        ShowAvailableArea(part: PartType, areas: Area[]): void {
            this.clearSelectionApi();
            this.clearAvailableAreas();

            areas.forEach((area: Area) => {
                const cubeData = this.bizdata.cubeMap.get(area.cubeId);
                if (cubeData !== undefined) {
                    const width = area.endPoint.x - area.startPoint.x;
                    const height = area.endPoint.y - area.startPoint.y;
                    const depth = area.endPoint.z - area.startPoint.z;
                    const availableArea = BABYLON.MeshBuilder.CreateBox(
                        `BackgroundArea_${area.cubeId}_${part.id.toString()}`,
                        { width: width, height: height, depth: depth },
                        this.graphics.scene as BABYLON.Scene,
                    );
                    const areaMat = new BABYLON.StandardMaterial("AvailableArea", this.graphics.scene as BABYLON.Scene);

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
            });
        },

        ShowCubeAddArea(part: PartType): void {
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

        getAvailableArea(partId: string): Area[] {
            const biz: BizData = this.bizdata as BizData;
            return drobeUtil.getAvailableAreaById(biz, partId);
        },

        getAvailableAreaByPart(part: PartType): Area[] {
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
                            this.gui.display(this.graphics, this.bizdata as BizData, rootMesh);

                            const meshName = pointerInfo.pickInfo.pickedMesh.name;
                            if (meshName.startsWith("BackgroundArea")) {
                                // Hit the available area.
                                const info = meshName.split("_");
                                const cubeId = info[1];
                                const manifest = this.newPart.manifest;

                                if (cubeId === "StartCube" || cubeId === "EndCube") {
                                    request({
                                        url: this.baseOSSUrl + manifest,
                                        method: "GET",
                                        responseType: "json",
                                    })
                                        .then((res) => {
                                            const isFirstCube = cubeId === "StartCube";
                                            const cubeMf = res.data;
                                            const cubeUUID = uuidv4();
                                            const originX = isFirstCube
                                                ? this.bizdata.startX + this.newPart.width * 0.5
                                                : this.bizdata.endX - this.newPart.width * 0.5;
                                            const itemOrigin = new BABYLON.Vector3(originX, 0, 0);

                                            // TODO: create a parent mesh to contain all import meshes.
                                            cubeMf.models.forEach((model: any) => {
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
                                                const modelUrl = this.baseOSSUrl + model.url;
                                                this.graphics.importMesh(
                                                    modelUrl,
                                                    itemName,
                                                    modelPos,
                                                    BABYLON.Vector3.Zero(),
                                                    modelScaling,
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
                                            this.bizdata.addCube(newCube, isFirstCube);
                                        })
                                        .catch((err) => {
                                            throw Error(`Require manifest by error: ${manifest}`);
                                        });
                                } else {
                                    const cubeData = this.bizdata.cubeMap.get(cubeId);
                                    if (
                                        cubeData !== undefined &&
                                        manifest !== undefined &&
                                        pointerInfo.pickInfo.pickedPoint !== null
                                    ) {
                                        const pickedPointY = pointerInfo.pickInfo.pickedPoint.y;

                                        request({
                                            url: this.baseOSSUrl + manifest,
                                            method: "GET",
                                            responseType: "json",
                                        })
                                            .then((res) => {
                                                const itemMf = res.data;
                                                const itemId = uuidv4();
                                                const startPos = new BABYLON.Vector3(
                                                    0,
                                                    pickedPointY - itemMf.size.y * 0.5,
                                                    0,
                                                );
                                                const itemOrigin = new BABYLON.Vector3(
                                                    cubeData.origin.x + startPos.x,
                                                    cubeData.origin.y + startPos.y,
                                                    cubeData.origin.z + startPos.z,
                                                );

                                                // TODO: create a parent mesh to contain all import meshes.
                                                itemMf.models.forEach((model: any) => {
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
                                                    const modelUrl = this.baseOSSUrl + model.url;
                                                    this.graphics.importMesh(
                                                        modelUrl,
                                                        itemName,
                                                        modelPos,
                                                        BABYLON.Vector3.Zero(),
                                                        modelScaling,
                                                    );
                                                });

                                                const partId = this.newPart.id;
                                                const catId = this.newPart.catId;
                                                const size = new Size(
                                                    this.newPart.width,
                                                    this.newPart.height,
                                                    this.newPart.depth,
                                                );
                                                // TODO: only handle the case of locationType==1.
                                                const location = new Location(
                                                    1,
                                                    new Position(startPos.x, startPos.y, startPos.z),
                                                    null,
                                                );
                                                const newItem = new Item(
                                                    itemId,
                                                    partId,
                                                    manifest,
                                                    catId,
                                                    size,
                                                    location,
                                                );
                                                this.bizdata.addItem(newItem, cubeId);
                                            })
                                            .catch((err) => {
                                                throw Error(`Require manifest by error: ${manifest}`);
                                            });
                                    }
                                }

                                this.clearAvailableAreas();
                            }
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
                                break;
                        }
                        break;
                    case BABYLON.KeyboardEventTypes.KEYUP:
                        break;
                }
            });
        },

        setupWallandFloor(): void {
            // // Floor
            // this.floor = BABYLON.MeshBuilder.CreateBox(
            //     "Background_Floor",
            //     { width: 5.0, height: 0.01, depth: 2.0 },
            //     this.graphics.scene as BABYLON.Scene,
            // );
            // this.floor.position = new BABYLON.Vector3(0, 0, 0.7);
            // var floor_material = new BABYLON.StandardMaterial("floorMaterial", this.graphics.scene as BABYLON.Scene);
            // const texture = new BABYLON.Texture(
            //     "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/floor/cc720923-b9d4-4ad1-af1e-db98151cacec.jpg",
            //     this.graphics.scene as BABYLON.Scene,
            // );
            // texture.uScale = 2;
            // texture.vScale = 2;
            // floor_material.diffuseTexture = texture;
            // this.floor.material = floor_material;
            // this.floor.isPickable = false;
            // this.floor.receiveShadows = true;

            // Wall
            this.wall = BABYLON.MeshBuilder.CreateBox(
                "Background_Wall",
                { width: 5.0, height: 3.0, depth: 0.01 },
                this.graphics.scene as BABYLON.Scene,
            );
            this.wall.position = new BABYLON.Vector3(0, 1.5, -0.31);

            var wall_material = new BABYLON.StandardMaterial("groundMaterial", this.graphics.scene as BABYLON.Scene);
            wall_material.diffuseTexture = new BABYLON.Texture(
                "https://dev-salestool.oss-cn-shanghai.aliyuncs.com/salestool/img/wall/9c07a00f-856f-4977-836c-7733515706d4.jpg",
                this.graphics.scene as BABYLON.Scene,
            );
            this.wall.material = wall_material;
            this.wall.isPickable = false;
            this.wall.receiveShadows = true;
        },

        CreateReferenceRuler(showRuler: boolean): void {
            this.gui.showRuler(this.graphics, this.bizdata as BizData, showRuler);
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
