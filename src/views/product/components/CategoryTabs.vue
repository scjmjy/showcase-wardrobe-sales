<template>
    <div class="category-tabs" :class="{ 'is-level-up': !!tabStack.length }">
        <i
            v-if="!!tabStack.length && !slideLeft"
            class="category-tabs-levelup iconfont icon-level-up"
            @click="onUpLevelClick"
        ></i>
        <el-tabs v-model="selectedTabName" class="category-tabs-cats" tab-position="left">
            <el-tab-pane v-for="tab in activeTabs" :key="tab.name" :label="tab.label" :name="tab.name">
                <slot name="content-header" />
                <component
                    :is="tab.component"
                    :up="!!tabStack.length"
                    v-bind="tab.bind"
                    v-on="tab.on"
                    :active="selectedTabName === tab.name"
                />
                <slot name="content-footer" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, provide, ref, watch } from "vue";
import {
    findSiblingCats,
    Part,
    PartCategory,
    PartCategoryMeta,
    ProductCategory,
} from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
import CatTab from "./CatTab.vue";
import CatsList from "./CatsList.vue";
import { useStore } from "vuex";
import { StateType } from "@/store";

interface TabType {
    component: string;
    name: string;
    label: string;
    cat?: PartCategory;
    bind?: any;
    on?: any;
}

export type ActionType = "manifest" | "offer" | "save" | "complete";

export default defineComponent({
    name: "CategoryTabs",
    props: {
        type: {
            type: String as PropType<"in" | "out">,
            default: "out",
        },
        opened: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        CatTab,
        CatsList,
    },
    emits: ["update:opened", "part"],
    setup(props, ctx) {
        const store = useStore<StateType>();
        const cats = store.state.cats;
        const catMeta = ref<PartCategoryMeta>();
        const selectedTabName = ref<string>();
        const tabStack = ref<TabType[][]>([]);

        function onUpLevelClick() {
            tabStack.value.pop();
            const tabs = tabStack.value[tabStack.value.length - 1] || topLevelTabs.value;
            if (tabs.length) {
                selectedTabName.value = tabs[0].name;
            }
        }
        function cats2Tabs(cats: ProductCategory[]): TabType[] {
            return cats.map((c) => {
                let component = "";
                let bind = {};
                let on: any = {
                    up: onUpLevelClick,
                };
                if (c.leaf) {
                    component = "CatTab";
                    bind = {
                        cat: c,
                        active: false,
                    };
                    on.part = (part: Part, cat: PartCategory) => {
                        ctx.emit("part", part, cat);
                    };
                } else {
                    component = "CatsList";
                    bind = {
                        cats: c.children || [],
                    };

                    on.click = onCatItemClick;
                }
                return {
                    name: c.id.toString(),
                    label: c.name,
                    component,
                    bind,
                    on,
                    cat: c,
                };
            });
        }
        /**
         * @param cat 在 CatsList 里被点击的某个分类
         * @param cats cat 的兄弟节点
         */
        function onCatItemClick(cat: ProductCategory, cats: ProductCategory[]) {
            console.log("【partsTab】", cat);
            const tabs = cats2Tabs(cats);
            selectedTabName.value = cat.id.toString();
            tabStack.value.push(tabs);
        }

        const topLevelTabs = computed<TabType[]>(() => {
            const partsTabs = cats2Tabs(cats.value);
            return partsTabs;
        });
        watch(
            () => topLevelTabs.value,
            (tabs) => {
                tabStack.value.length = 0;
                if (tabs.length) {
                    selectedTabName.value = tabs[0].name;
                } else {
                    selectedTabName.value = "";
                }
            },
        );

        const activeTabs = computed(() => {
            const len = tabStack.value.length;
            return tabStack.value[len - 1] || topLevelTabs.value;
        });

        const selectedPartId = ref(0);
        // const selectedPart = ref<Part>();
        const selectedCatId = ref(0);

        provide("selectedPartId", selectedPartId);
        // provide("selectedPart", selectedPart);

        // watch(
        //     () => selectedPart.value,
        //     (part) => {
        //         ctx.emit("select-part", part);
        //     },
        // );

        return {
            cats,
            activeTabs,
            topLevelTabs,
            tabStack,
            catMeta,
            selectedTabName,
            onUpLevelClick,
            selectPart(catId: string | number, partId: string | number) {
                selectedPartId.value = +partId;
                for (const tab of activeTabs.value) {
                    if (tab.cat && tab.cat.id == catId) {
                        selectedTabName.value = catId.toString();
                        return;
                    }
                }
                // 清空堆栈
                tabStack.value.length = 0;

                const siblings = findSiblingCats(catId, cats.value);
                if (siblings) {
                    const tabs = cats2Tabs(siblings);
                    selectedTabName.value = catId.toString();
                    tabStack.value.push(tabs);

                    selectedCatId.value = +catId;
                }
            },
        };
    },
});
</script>

<style scoped lang="scss">
.category-tabs {
    position: relative;
    height: 100%;
    background-color: white;
    overflow: hidden;
    white-space: nowrap;

    &-levelup {
        cursor: pointer;
        position: absolute;
        left: 20px;
        top: 0px;
        padding: 10px;
        color: var(--el-color-black);
        font-size: 30px;
        z-index: 100;
        &:hover {
            color: var(--el-color-primary);
        }
    }
    &.is-level-up {
        :deep(.el-tabs__header) {
            padding-top: 45px;
        }
    }
    &-cats {
        height: 100%;
        white-space: pre-wrap;
        margin-left: 0px !important;
        margin-right: 0px !important;
        overflow-y: auto;
        :deep(.el-tabs__item) {
            font-size: 15px;
            &.is-active {
                font-weight: bold;
            }
        }
        :deep(.el-tabs__header) {
            margin-right: 0px;
            padding-top: 10px;
            background-color: var(--el-color-bg);
        }
        :deep(.el-tabs__content) {
            padding-left: 10px;
            height: 100%;
            .el-tab-pane {
                height: 100%;
            }
        }
        :deep(.el-tabs__active-bar.is-left) {
            left: 0;
            right: auto;
            width: 5px;
            min-height: 40px;
            // height: 30px !important;
            // min-height: 30px;
            background-color: var(--el-text-color-primary);
        }

        :deep(.el-tabs__nav-scroll) {
            width: 90px;
        }
        :deep(.el-tabs__nav-wrap::after) {
            width: 5px !important;
            left: 0px !important;
            background-color: #d8d8d8ff;
        }
    }
}
</style>
