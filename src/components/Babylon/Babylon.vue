<template>
    <div>
        <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import * as BABYLON from "babylonjs";
import { Graphics, GraphicsEvent } from "@/lib/graphics";
import { Scheme, Cube, Item, Door, Part, Position, RelativeItem, Location, Area } from "@/lib/scheme";
import * as util from "@/lib/scheme.util";
import { BizData, ObjectType } from "@/lib/biz.data";
import { v4 as uuidv4 } from "uuid";
import { drobeUtil } from "@/lib/drobe.util";
import * as event from "@/lib/biz.event";
import { PopupGUI } from "@/lib/hm_gui";

export interface PartType {
    id: number;
    width: number;
    height: number;
    depth: number;
    manifest: string;
    catId: number;
}

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
            default: 1,
        },
        scheme: {
            type: Scheme,
            default: null,
        },
        selectedPartId: {
            type: Number,
            default: 0,
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
        getAvailableArea2: {
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
        selectedPartId: {
            deep: true,
            immediate: true,
            handler(newSelectedPartId) {
                console.log("SelectedPartId: ", newSelectedPartId);

                if (newSelectedPartId != 0) {
                    const availableArea = this.getAvailableArea2(newSelectedPartId);
                    // const availableArea = this.getAvailableArea(newSelectedPartId);
                    this.ShowAvailableArea(newSelectedPartId, availableArea);
                }
            },
        },
        selectedPart: {
            deep: true,
            handler(newPart: PartType) {
                if (newPart.id) {
                    console.log("【watch selectedPart】 ", newPart);
                }
            },
        },
    },
    async mounted() {
        this.bizdata = new BizData(this.scheme);

        // set the scene size as 7500 mm.
        this.graphics.init(7500 * this.bizdata.SceneUnit);
        this.graphics.render();

        this.setupInteraction();
        this.setupKeyboard();
        this.handleGraphicsEvent(this.graphics);

        this.loadScheme();

        // guilin: test: add a door
        // drobeUtil.test_addDoor(this.graphics as graphics.Graphics, this.scheme );
        this.setupWallandFloor();
    },
    methods: {
        /**
         * 修改墙面
         * @param newPartId
         */
        changeWallApi(newPartId: number): void {
            const wall_material = new BABYLON.StandardMaterial("WallMaterial", this.graphics.scene as BABYLON.Scene);
            wall_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            var temp = this.bizdata.partManifestMap.get(newPartId.toString());
            wall_material.diffuseTexture = new BABYLON.Texture(String(temp), this.graphics.scene as BABYLON.Scene);
            this.wall.material = wall_material;
            this.wall.isPickable = false;
        },

        /**
         * 修改地板
         * @param newPartId
         */
        changeFloorApi(newPartId: number): void {
            var floor_material = new BABYLON.StandardMaterial("floorMaterial", this.graphics.scene as BABYLON.Scene);
            floor_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            var temp = this.bizdata.partManifestMap.get(newPartId.toString());
            floor_material.diffuseTexture = new BABYLON.Texture(String(temp), this.graphics.scene as BABYLON.Scene);
            this.floor.material = floor_material;
            this.floor.isPickable = false;
        },

        /**
         * 修改单元柜的材质或颜色
         * @param cubeId 需要修改的单元柜id
         * @param newPartId 修改后单元柜对应的partId
         */
        changeCubeApi(cubeId: string, newPartId: number, newManifest: string): void {},

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
         * @param newPartId 修改后配件对应的partId
         */
        changeItemApi(itemId: string, newPartId: number, newManifest: string): void {},

        /**
         * 增加一个合页门或者滑门
         *
         * Usage:
         *   1. select cubes in 3D canvas;
         *   2. select a door in 2D list;
         *   3. create 'Door' object without uuid;
         *   4. call this API;
         *
         * NOTE: newDoor 中的id在调用的时候无需传入，该API会创建并返回这个UUID
         *
         * @param newDoor 新增加的Door
         */
        addDoorApi(newDoor: Door): string {
            return drobeUtil.addDoor(this.graphics, this.bizdata as BizData, newDoor);
        },

        /**
         * 移除合页门或者滑门
         * @param doorIds 被移除门的uuid列表
         */
        removeDoorsApi(doorIds: string[]): void {},

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
        clearSelectionApi(): void {},

        /**
         * 设置编辑模式
         * @param mode 编辑模式：
         * 1 - 外观（free camera，内配不能被选择）
         * 2 - 内配（fixed camera，柜体不能被选择）
         * 3 - 浏览模式（free camera，柜体和内配都不能选择）
         */
        setModeApi(mode: number): void {},

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
                switch (info[0]) {
                    case ObjectType.CUBE:
                        {
                            const cube = this.bizdata.findCubeById(id);
                            if (cube !== undefined) {
                                const category = "柜体";
                                const objectSelectedEvent = new event.ObjectSelectedEvent(category, cube.partId, cube);
                                this.eventEmit(objectSelectedEvent);
                            }
                        }
                        break;
                    case ObjectType.ITEM:
                        {
                            const item = this.bizdata.findItemById(id);
                            if (item !== undefined) {
                                const category = "配件";
                                const objectSelectedEvent = new event.ObjectSelectedEvent(category, item.partId, item);
                                this.eventEmit(objectSelectedEvent);
                            }
                        }
                        break;
                    case ObjectType.DOOR:
                        {
                            const door = this.bizdata.findDoorById(id);
                            if (door !== undefined) {
                                const category = "门";
                                const objectSelectedEvent = new event.ObjectSelectedEvent(category, door.partId, door);
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
                            if (cube !== undefined) {
                                const category = "柜体";
                                const objectUnselectedEvent = new event.ObjectUnselectedEvent(
                                    category,
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
                            if (item !== undefined) {
                                const category = "配件";
                                const objectUnselectedEvent = new event.ObjectUnselectedEvent(
                                    category,
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
                            if (door !== undefined) {
                                const category = "门";
                                const objectUnselectedEvent = new event.ObjectUnselectedEvent(
                                    category,
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
            const cubeSizeArr: any[] = [];
            const cubeIdArr: string[] = [];
            const cubeMfArr: any[] = [];

            const cubes = this.scheme.cubes;
            let cubeIndex = 0;
            this.scheme.cubes.forEach((cube: Cube) => {
                const cubeMf = util.parseManifest(cube.manifest);

                this.bizdata.totalWidth += cubeMf.size.x;
                if (cubeMf.size.y > this.bizdata.totalHeight) this.bizdata.totalHeight = cubeMf.size.y;
                if (cubeMf.size.z > this.bizdata.totalDepth) this.bizdata.totalDepth = cubeMf.size.z;

                cubeSizeArr[cubeIndex] = cubeMf.size;
                cubeIdArr[cubeIndex] = cube.id;
                cubeMfArr[cubeIndex] = cubeMf;
                cubeIndex++;
            });

            let startX = this.bizdata.totalWidth * 0.5;
            cubeIndex = 0;
            this.scheme.cubes.forEach((cube: Cube) => {
                const cubeSize = cubeSizeArr[cubeIndex];
                const cubeId = cubeIdArr[cubeIndex];
                const cubeMf = cubeMfArr[cubeIndex];
                cubeIndex++;
                const cubeOriginX = startX - cubeSize.x * 0.5;
                startX -= cubeSize.x;

                const cubeOrigin = new BABYLON.Vector3(cubeOriginX, 0, 0);
                this.bizdata.cubeMap.set(cubeId, {
                    origin: cubeOrigin,
                    width: cubeSize.x,
                    height: cubeSize.y,
                    depth: cubeSize.z,
                });

                cubeMf.models.forEach((model: any) => {
                    const modelPos = new BABYLON.Vector3(
                        cubeOrigin.x + model.position.x,
                        cubeOrigin.y + model.position.y,
                        cubeOrigin.z + model.position.z,
                    );
                    const cubeName = ObjectType.CUBE + "_" + cubeId;
                    this.graphics.importMesh(
                        model.url,
                        cubeName,
                        modelPos,
                        BABYLON.Vector3.Zero(),
                        BABYLON.Vector3.One(),
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

                                        const itemMf = util.parseManifest(item.manifest);
                                        itemMf.models.forEach((model: any) => {
                                            const modelPos = new BABYLON.Vector3(
                                                itemOrigin.x + model.position.x,
                                                itemOrigin.y + model.position.y,
                                                itemOrigin.z + model.position.z,
                                            );

                                            const itemName = ObjectType.ITEM + "_" + item.id;
                                            this.graphics.importMesh(model.url, itemName, modelPos);
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
            });
        },

        ShowAvailableArea(partId: number, areas: Area[]): void {
            areas.forEach((area: Area) => {
                const cubeData = this.bizdata.cubeMap.get(area.cubeId);
                if (cubeData !== undefined) {
                    const width = area.endPoint.x - area.startPoint.x;
                    const height = area.endPoint.y - area.startPoint.y;
                    const depth = area.endPoint.z - area.startPoint.z;
                    const availableArea = BABYLON.MeshBuilder.CreateBox(
                        `BackgroundArea_${partId.toString()}_${area.cubeId}`,
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
                    availableArea.edgesWidth = 500 * this.bizdata.SceneUnit;
                    availableArea.edgesColor = new BABYLON.Color4(1, 1, 1, 1);

                    this.availableAreas.push(availableArea);
                }
            });
        },

        getAvailableArea(partId: string): Area[] {
            const biz: BizData = this.bizdata as BizData;
            return drobeUtil.getAvailableAreaById(biz, partId);
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
                            this.gui.display(this.graphics, pointerInfo.pickInfo.pickedMesh);
                            const meshName = pointerInfo.pickInfo.pickedMesh.name;
                            if (meshName.startsWith("BackgroundArea")) {
                                // Hit the available area.
                                const info = meshName.split("_");
                                const partId = info[1];
                                const cubeId = info[2];

                                const cubeData = this.bizdata.cubeMap.get(cubeId);
                                const manifest = this.bizdata.partManifestMap.get(partId);
                                if (
                                    cubeData !== undefined &&
                                    manifest !== undefined &&
                                    pointerInfo.pickInfo.pickedPoint !== null
                                ) {
                                    const itemId = uuidv4();
                                    const itemMf = util.parseManifest(manifest);

                                    const startPos = new BABYLON.Vector3(
                                        0,
                                        pointerInfo.pickInfo.pickedPoint.y - itemMf.size.y * 0.5,
                                        0,
                                    );
                                    const itemOrigin = new BABYLON.Vector3(
                                        cubeData.origin.x + startPos.x,
                                        cubeData.origin.y + startPos.y,
                                        cubeData.origin.z + startPos.z,
                                    );

                                    itemMf.models.forEach((model: any) => {
                                        const modelPos = new BABYLON.Vector3(
                                            itemOrigin.x + model.position.x,
                                            itemOrigin.y + model.position.y,
                                            itemOrigin.z + model.position.z,
                                        );
                                        this.graphics.importMesh(model.url, itemId, modelPos);
                                    });

                                    // TODO: only handle the case of locationType==1.
                                    const location = new Location(
                                        1,
                                        new Position(startPos.x, startPos.y, startPos.z),
                                        null,
                                    );
                                    const newItem = new Item(itemId, Number(partId), manifest, location);
                                    this.bizdata.addItem(newItem, cubeId);

                                    this.clearAvailableAreas();
                                }
                            }
                        } else {
                            this.gui.display(this.graphics, null);
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
                                console.log("To test...");
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
                { width: 5000.0, height: 0.1, depth: 2000.0 },
                this.graphics.scene as BABYLON.Scene,
            );
            this.floor.translate(new BABYLON.Vector3(0, -20, -1820), -0.4);
            var floor_material = new BABYLON.StandardMaterial("floorMaterial", this.graphics.scene as BABYLON.Scene);
            floor_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            floor_material.diffuseTexture = new BABYLON.Texture(
                "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/floor/dc5eb19b-2879-47fe-a517-720b39e0f445.jpg",
                this.graphics.scene as BABYLON.Scene,
            );
            this.floor.material = floor_material;
            this.floor.isPickable = false;

            // Wall
            this.wall = BABYLON.MeshBuilder.CreateBox(
                "Background_Wall",
                { width: 5000.0, height: 3000.1, depth: 0.1 },
                this.graphics.scene as BABYLON.Scene,
            );
            this.wall.translate(new BABYLON.Vector3(0, -3750, 780), -0.4);
            var wall_material = new BABYLON.StandardMaterial("groundMaterial", this.graphics.scene as BABYLON.Scene);
            wall_material.emissiveColor = new BABYLON.Color3(255 / 255, 255 / 255, 255 / 255);
            wall_material.diffuseTexture = new BABYLON.Texture(
                "https://cld-dev-oss.oss-cn-hangzhou.aliyuncs.com/salestool/img/wall/d8282dee-13f2-4884-99c0-5d56962d95ac.jpg",
                this.graphics.scene as BABYLON.Scene,
            );
            this.wall.material = wall_material;
            this.wall.isPickable = false;
        },
    },
});
</script>
