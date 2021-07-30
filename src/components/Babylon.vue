<template>
    <div>
        <h2>This is a babylon page</h2>
        <canvas class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
</template>

<script lang="ts">
import { Item, Door, Scheme, Area } from "@/api/scheme";

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
            default: (): void => {},
        },
        getAvailableArea: {
            type: Function,
            default: (): void => {},
        },
    },
    methods: {
        /**
         * 修改墙面
         * @param newPartId
         */
        changeWallApi(newPartId: number, newManifest: string): void {
            newPartId;
            newManifest;
        },

        /**
         * 修改地板
         * @param newPartId
         */
        changeFloorApi(newPartId: number, newManifest: string): void {
            newPartId;
            newManifest;
        },

        /**
         * 修改单元柜的材质或颜色
         * @param cubeId 需要修改的单元柜id
         * @param newPartId 修改后单元柜对应的partId
         */
        changeCubeApi(cubeId: string, newPartId: number, newManifest: string): void {
            cubeId;
            newPartId;
            newManifest;
        },

        /**
         * 增加一个item
         * @param newItem 增加的Item
         */
        addItemApi(newItem: Item): void {
            newItem;
        },

        /**
         * 移除多个items
         * @param itemIds 被移除item的uuid列表
         */
        removeItemsApi(itemIds: string[]): void {
            itemIds;
        },

        /**
         * 修改配件的材质或颜色
         * @param itemId 需要修改的item id
         * @param newPartId 修改后配件对应的partId
         */
        changeItemApi(itemId: string, newPartId: number, newManifest: string): void {
            itemId;
            newPartId;
            newManifest;
        },

        /**
         * 增加一个合页门或者滑门
         * @param newDoor 新增加的Door
         */
        addDoorApi(newDoor: Door): void {
            newDoor;
        },

        /**
         * 移除合页门或者滑门
         * @param doorIds 被移除门的uuid列表
         */
        removeDoorsApi(doorIds: string[]): void {
            doorIds;
        },

        /**
         * 修改合页门或滑门的材质或颜色
         * @param doorId 需要修改的door uuid
         * @param newPartId
         */
        changeDoorApi(doorId: string, newPartId: number, newManifest: string): void {
            doorId;
            newPartId;
            newManifest;
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

        /**
         * 显示多个有效区域（用于添加配件的待选区域）
         * @param availableAreas 有效区域的列表
         */
        showAvailableAreaApi(availableAreas: Area[]): void {
            availableAreas;
        },

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
        setModeApi(mode: number): void {
            mode;
        },

        /**
         * 获得当前最新的柜体设计方案
         */
        getSchemeApi(): Scheme {
            return new Scheme([], [], []);
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
    },
};
</script>
