<template>
    <div>
        <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
</template>

<script>
import * as babylon from "./babylon";
import * as util from "./util";
import * as bizdata from "./bizdata";

export default {
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
            type: Object,
            default: null,
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
    async mounted() {
        const canvas = document.getElementById("canvas");
        this.graphics = new babylon.Graphics(canvas);
        // set the scene size as 7500 mm.
        this.graphics.init(7500 * util.SceneUnit);
        this.graphics.render();

        this.bizdata = new bizdata.BizData(this.scheme);

        this.loadScheme();
    },
    methods: {
        // /**
        //  * 修改墙面
        //  * @param newPartId
        //  */
        // changeWallApi(newPartId: number, newManifest: string): void {
        //     newPartId;
        //     newManifest;
        // },

        // /**
        //  * 修改地板
        //  * @param newPartId
        //  */
        // changeFloorApi(newPartId: number, newManifest: string): void {
        //     newPartId;
        //     newManifest;
        // },

        // /**
        //  * 修改单元柜的材质或颜色
        //  * @param cubeId 需要修改的单元柜id
        //  * @param newPartId 修改后单元柜对应的partId
        //  */
        // changeCubeApi(cubeId: string, newPartId: number, newManifest: string): void {
        //     cubeId;
        //     newPartId;
        //     newManifest;
        // },

        // /**
        //  * 增加一个item
        //  * @param newItem 增加的Item
        //  */
        // addItemApi(newItem: Item): void {
        //     newItem;
        // },

        // /**
        //  * 移除多个items
        //  * @param itemIds 被移除item的uuid列表
        //  */
        // removeItemsApi(itemIds: string[]): void {
        //     itemIds;
        // },

        // /**
        //  * 修改配件的材质或颜色
        //  * @param itemId 需要修改的item id
        //  * @param newPartId 修改后配件对应的partId
        //  */
        // changeItemApi(itemId: string, newPartId: number, newManifest: string): void {
        //     itemId;
        //     newPartId;
        //     newManifest;
        // },

        // /**
        //  * 增加一个合页门或者滑门
        //  * @param newDoor 新增加的Door
        //  */
        // addDoorApi(newDoor: Door): void {
        //     newDoor;
        // },

        // /**
        //  * 移除合页门或者滑门
        //  * @param doorIds 被移除门的uuid列表
        //  */
        // removeDoorsApi(doorIds: string[]): void {
        //     doorIds;
        // },

        // /**
        //  * 修改合页门或滑门的材质或颜色
        //  * @param doorId 需要修改的door uuid
        //  * @param newPartId
        //  */
        // changeDoorApi(doorId: string, newPartId: number, newManifest: string): void {
        //     doorId;
        //     newPartId;
        //     newManifest;
        // },

        // /**
        //  * 批量操作，比如：合页门换滑门（删除合页门，再增加滑门）
        //  * 备注：操作是有顺序的
        //  * @param actions 批量操作的列表
        //  */
        // batchActionsApi(
        //     actions: [
        //         {
        //             method: string; // 与某个api函数名一致，比如："addDoorApi"
        //             param: any[]; // api函数的参数列表
        //         },
        //     ],
        // ): void {
        //     actions;
        // },

        // /**
        //  * 显示多个有效区域（用于添加配件的待选区域）
        //  * @param availableAreas 有效区域的列表
        //  */
        // showAvailableAreaApi(availableAreas: Area[]): void {
        //     availableAreas;
        // },

        // /**
        //  * 清空选择中的item
        //  */
        // clearSelectionApi(): void {},

        // /**
        //  * 设置编辑模式
        //  * @param mode 编辑模式：
        //  * 1 - 外观（free camera，内配不能被选择）
        //  * 2 - 内配（fixed camera，柜体不能被选择）
        //  * 3 - 浏览模式（free camera，柜体和内配都不能选择）
        //  */
        // setModeApi(mode: number): void {
        //     mode;
        // },

        // /**
        //  * 获得当前被选中的物件（可能存在多选）
        //  * @result 返回当前被选中items的uuid
        //  */
        // getSelectedItemsApi(): string[] {
        //     return [];
        // },

        // /**
        //  * 选择items
        //  * 备注：在全选或者多选模式下使用
        //  * @param itemIds 需要被选择item的uuid列表
        //  */
        // selectItemsApi(itemIds: string[]): void {
        //     itemIds;
        // },

        // /**
        //  * 清空所有的内配
        //  */
        // clearItemsApi(): void {},

        loadScheme() {
            const cubeSizeArr = [];
            const cubeIdArr = [];
            const cubeMfArr = [];

            const cubes = this.scheme.cubes;
            let cubeIndex = 0;
            cubes.forEach((cube) => {
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
            cubes.forEach((cube) => {
                const cubeSize = cubeSizeArr[cubeIndex];
                const cubeId = cubeIdArr[cubeIndex];
                const cubeMf = cubeMfArr[cubeIndex];
                cubeIndex++;
                const cubeOriginX = startX - cubeSize.x * 0.5;
                startX -= cubeSize.x;

                const cubeOrigin = new BABYLON.Vector3(cubeOriginX, 0, 0);
                this.bizdata.cubeData[cubeId] = {
                    origin: cubeOrigin,
                    width: cubeSize.x,
                    height: cubeSize.y,
                    depth: cubeSize.z,
                };

                cubeMf.models.forEach((model) => {
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

                cube.items.forEach((item) => {
                    switch (item.location.locationType) {
                        case 1: // 中间位置（抽屉、隔板、挂衣杆等）
                            {
                                const startPos = item.location.startPos;
                                const itemOrigin = new BABYLON.Vector3(
                                    cubeOrigin.x - startPos.x,
                                    cubeOrigin.y + startPos.y,
                                    cubeOrigin.z + startPos.z,
                                );

                                const itemMf = util.parseManifest(item.manifest);
                                itemMf.models.forEach((model) => {
                                    const modelPos = new BABYLON.Vector3(
                                        itemOrigin.x + model.position.x,
                                        itemOrigin.y + model.position.y,
                                        itemOrigin.z + model.position.z,
                                    );
                                    this.graphics.importMesh(model.url, item.id, modelPos);
                                });
                            }
                            break;
                        case 2: // 两侧位置（镜子）
                            // TODO:
                            break;
                        case 3: // 基于其他part的相对位置
                            // TODO:
                            break;
                    }
                });
            });
        },
    },
};
</script>
