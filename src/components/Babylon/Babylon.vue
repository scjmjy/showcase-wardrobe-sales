<template>
    <div>
        <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as BABYLON from "babylonjs";
import * as graphics from "./graphics";
import { Scheme, Cube, Item, Door, Part, Position, RelativeItem, Location, Area } from "@/lib/scheme";
import * as util from "../../lib/scheme.util";
import * as bizdata from "./bizdata";
import { v4 as uuidv4 } from "uuid";
import { drobeUtil } from "@/lib/drobe.util";


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
        eventEmit: {
            type: Function,
            default: () => {},
        },
        getAvailableArea: {
            type: Function,
            default: () => {},
        },
    },
    data() {
        return {
            bizdata: {} as bizdata.BizData,
            graphics: {} as graphics.Graphics,
            availableAreas: [] as BABYLON.Mesh[],
        };
    },
    watch: {
        selectedPartId: {
            deep: true,
            immediate: true,
            handler(newSelectedPartId) {
                console.log("SelectedPartId: ", newSelectedPartId);

                if (newSelectedPartId != 0) {
                    const availableArea = this.getAvailableArea(newSelectedPartId);
                    this.ShowAvailableArea(newSelectedPartId, availableArea);
                }
            },
        },
    },
    async mounted() {
        this.bizdata = new bizdata.BizData(this.scheme);

        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.graphics = new graphics.Graphics(canvas);
        // set the scene size as 7500 mm.
        this.graphics.init(7500 * this.bizdata.SceneUnit);
        this.graphics.render();

        this.setupInteraction();
        this.setupKeyboard();

        this.loadScheme();

        // guilin: test: add a door
        // drobeUtil.test_addDoor(this.graphics as graphics.Graphics, this.scheme );
    },
    methods: {
        /**
         * 修改墙面
         * @param newPartId
         */
        changeWallApi(newPartId: number, newManifest: string): void {},

        /**
         * 修改地板
         * @param newPartId
         */
        changeFloorApi(newPartId: number, newManifest: string): void {},

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
         * 增加一个合页门或者滑门. 
         * 
         * Usage: 
         *   1. select cubes in 3D canvas; 
         *   2. select a door in 2D list;
         *   3. create 'Door' object without uuid; 
         *   4. call this API;
         * 
         * NOTE: newDoor 中的id在调用的时候无需传入，该API会创建并返回这个UUID。
         * 
         * @param newDoor 新增加的Door
         */
        addDoorApi(newDoor: Door): string {
            return drobeUtil.addDoor(this.graphics as graphics.Graphics, this.scheme, newDoor);
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
                    this.graphics.importMesh(
                        model.url,
                        cubeId,
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
                                            this.graphics.importMesh(model.url, item.id, modelPos);
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

        clearAvailableAreas(): void {
            if (this.availableAreas === undefined) return;

            this.availableAreas.forEach((area) => {
                area.dispose();
            });
            this.availableAreas.length = 0;
        },

        setupInteraction() {
            this.graphics.scene.onPointerObservable.add((pointerInfo) => {
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        if (pointerInfo && pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
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
                                    this.bizdata.AddItem(newItem, cubeId);

                                    this.clearAvailableAreas();
                                }
                            }
                        }
                        break;
                }
            });
        },

        setupKeyboard(): void {
            this.graphics.scene.onKeyboardObservable.add((kbInfo) => {
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
        }
    },
});
</script>
