<template>
    <div ref="refDiv" class="parts-menu">
        <div class="parts-menu__left">
            <div class="parts-menu__left-header">
                <div>
                    <!-- <el-button v-if="tabStack.length" type="text" @click="onUpLevelClick">上一层</el-button> -->
                </div>
                <div>
                    <el-button type="primary" plain @click="$emit('action', 'manifest')">清单</el-button>
                    <el-button type="primary" plain @click="$emit('action', 'offer')">报价</el-button>
                    <el-button type="primary" plain @click="$emit('action', 'save')">保存</el-button>
                </div>
                <div></div>
            </div>
            <!-- <el-row class="parts-menu__left-items" :gutter="20">
                <el-col v-for="cat in cats" :key="cat.id" :span="12" style="padding: 10px">
                    <part-cat-card :cat="cat" :active="selectedCatId == cat.id" @select="onCatSelect"></part-cat-card>
                </el-col>
            </el-row> -->

            <!-- <el-tabs v-model="selectedCatId" class="parts-menu__left-cats" tab-position="left" @tab-click="onCatChange">
                <el-tab-pane v-for="cat in activeCats" :key="cat.id" :label="cat.name" :name="cat.id.toString()">
                    <cat-tab :active="selectedCatId === cat.id.toString()" :cat="cat" />
                </el-tab-pane>
            </el-tabs> -->
            <el-tabs
                v-model="selectedTabName"
                class="parts-menu__left-cats"
                tab-position="left"
                @tab-click="onCatChange"
            >
                <el-tab-pane v-for="(tab, index) in activeTabs" :key="tab.name" :label="tab.label" :name="tab.name">
                    <template v-if="index === 0" #label>
                        <div class="parts-menu__tab-bgLabel">{{ tab.label }}</div>
                    </template>
                    <component :is="tab.component" :up="!!tabStack.length" v-bind="tab.bind" v-on="tab.on" />
                </el-tab-pane>
            </el-tabs>
        </div>
        <!-- <div class="parts-menu__right">
            <div class="parts-menu__right-header">
                <el-button class="parts-menu__right-header-back" icon="el-icon-arrow-left" type="text" @click="gotoLeft"
                    >返回</el-button
                >
                <span>
                    {{ cat.name || "子分类" }}
                </span>
            </div>
            <div class="parts-menu__right-material"></div>
            <div class="parts-menu__right-color"></div>
            <div class="parts-menu__right-items"></div>
        </div>-->
        <i
            class="parts-menu__trigger"
            :class="{
                'el-icon-arrow-left': !opened,
                'el-icon-arrow-right': opened,
            }"
            type="text"
            @click="$emit('update:opened', !opened)"
        ></i>
    </div>
</template>

<script lang="ts">
import {
    BackgroundType,
    findSiblingCats,
    Part,
    PartCategory,
    PartCategoryMeta,
    ProductCategory,
} from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType, provide, ref, watch } from "vue";
import { useStore } from "vuex";
import apiProvider from "@/api/provider";
import PartCatCard from "./PartCatCard.vue";
import CatTab from "./CatTab.vue";
import { ElTabPane } from "element-plus";
import { StateType } from "@/store";
import PartBgTab from "./PartBgTab.vue";
import CatsList from "./CatsList.vue";

interface TabType {
    component: string;
    name: string;
    label: string;
    cat?: PartCategory;
    bind?: any;
    on?: any;
}

export type ActionType = "manifest" | "offer" | "save";

export default defineComponent({
    name: "PartsMenu",
    props: {
        type: {
            type: String as PropType<"in" | "out">,
            default: "out",
        },
        cat: {
            type: Object as PropType<PartCategory>,
            default: () => ({}),
        },
        opened: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        CatTab,
        PartBgTab,
        CatsList,
        // PartCatCard,
    },
    emits: ["update:opened", "part", "action"],
    setup(props, ctx) {
        const store = useStore<StateType>();
        const refDiv = ref<HTMLDivElement>();
        const cats = ref<PartCategory[]>([]);
        const catMeta = ref<PartCategoryMeta>();
        const selectedTabName = ref("bg");
        apiProvider.requestPartCategories().then((res) => {
            if (res.ok) {
                cats.value = res.data || [];
            }
        });
        const typeText = computed(() => (props.type === "in" ? "内配" : "外观"));
        const inCats = computed(() => {
            if (!store.state.globalCfg) {
                return [];
            }
            return cats.value.filter((c) => store.state.globalCfg?.partsCatInterior.includes(c.id));
        });
        const outCats = computed(() => {
            if (!store.state.globalCfg) {
                return [];
            }
            return cats.value.filter((c) => store.state.globalCfg?.partsCatExterior.includes(c.id));
        });
        const activeCats = computed(() => (props.type === "in" ? inCats.value : outCats.value));
        const tabStack = ref<TabType[][]>([]);
        watch(
            () => activeCats.value,
            (cats) => {
                tabStack.value.length = 0;
                if (topLevelTabs.value.length >= 2) {
                    selectedTabName.value = topLevelTabs.value[1].name;
                } else {
                    selectedTabName.value = "bg";
                }
            },
        );

        const bgTab: TabType = {
            name: "bg",
            label: "背景",
            component: "PartBgTab",
            bind: {},
            on: {},
        };

        function onUpLevelClick() {
            tabStack.value.pop();
            const tabs = tabStack.value[tabStack.value.length - 1] || topLevelTabs.value;
            if (tabs.length >= 2) {
                selectedTabName.value = tabs[1].name;
            } else {
                selectedTabName.value = "bg";
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
                        active: true,
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
            tabStack.value.push([bgTab, ...tabs]);
        }

        const topLevelTabs = computed<TabType[]>(() => {
            // const partsTab = {
            //     name: "parts",
            //     label: typeText.value,
            //     component: "CatsList",
            //     bind: {
            //         cats: activeCats.value,
            //     },
            //     on: {
            //         click: onCatItemClick,
            //     },
            // };
            const partsTabs = cats2Tabs(activeCats.value);
            // const partsTab = {
            //     name: "parts",
            //     label: typeText.value,
            //     component: "CatsList",
            //     bind: {
            //         cats: activeCats.value,
            //     },
            //     on: {
            //         click: onCatItemClick,
            //     },
            // };
            return [bgTab, ...partsTabs];
        });

        const activeTabs = computed(() => {
            const len = tabStack.value.length;
            return tabStack.value[len - 1] || topLevelTabs.value;
        });

        const selectedPartId = ref(0);
        const selectedCatId = ref(0);

        provide("selectedPartId", selectedPartId);

        return {
            typeText,
            cats,
            activeCats,
            activeTabs,
            topLevelTabs,
            tabStack,
            catMeta,
            refDiv,
            selectedTabName,
            gotoLeft() {
                refDiv.value?.scrollBy({
                    behavior: "smooth",
                    left: -328,
                });
            },
            onCatChange(tab: any) {
                console.log("tab", tab.instance);

                // const catId = tab.props.name;
                // selectedCatId.value = catId;
                // requestPartCatMeta();
            },
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
                    // const activeTab = tabs.find((t) => t.cat.id.toString() === catId.toString());
                    // selectedTabName.value = activeTab.name;
                    selectedTabName.value = catId.toString();
                    tabs.unshift(bgTab);
                    tabStack.value.push(tabs);

                    selectedCatId.value = +catId;
                }
            },
            unselectPart(catId: string | number, partId: string | number) {
                selectedPartId.value = 0;
                selectedCatId.value = 0;
            },
        };
    },
});
</script>

<style scoped lang="scss">
$menu-width: 428px;
$header-height: 56px;
.parts-menu {
    // border-radius: 10px 0px 0px 10px;
    position: relative;
    box-shadow: 0px 10px 18px rgba(0, 0, 0, 0.07);
    background-color: var(--el-color-bg);
    width: $menu-width;
    max-width: $menu-width;
    overflow: hidden;

    :deep(.el-tabs__content) {
        height: 100%;
    }
    :deep(.el-tab-pane) {
        height: 100%;
    }
    &__left {
        display: inline-flex;
        flex-direction: column;
        overflow: hidden;
        width: $menu-width;
        height: 100%;
        vertical-align: top;
        &-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: $header-height;
            color: var(--el-color-black);
            font-size: 26px;
            font-weight: bold;
            box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.16);
        }
        &-cats {
            flex: 1;
            white-space: pre-wrap;
            margin-left: 0px !important;
            margin-right: 0px !important;
            padding: 10px 0px !important;
            overflow-y: auto;
            :deep(.el-tabs__active-bar.is-left) {
                left: 0;
                right: auto;
                width: 5px;
                min-height: 40px;
            }

            :deep(.el-tabs__nav-scroll) {
                width: 82px;
            }
            :deep(.el-tabs__nav-wrap::after) {
                width: 5px;
                left: 0px;
                background-color: var(--el-color-primary-light-8);
            }
            // :deep(.el-tabs__item:first-child) {
            //     border-bottom: 1px solid gray;
            // }
        }
    }
    &__tab-bgLabel {
        border-bottom: 2px solid gray;
        line-height: 30px;
    }
    // &__right {
    //     display: inline-flex;
    //     flex-direction: column;
    //     overflow: hidden;
    //     width: $menu-width;
    //     height: 100%;
    //     &-header {
    //         display: flex;
    //         align-items: flex-end;
    //         padding-left: 10px;
    //         padding-bottom: 10px;
    //         height: $header-height;
    //         color: var(--el-color-black);
    //         font-size: 26px;
    //         font-weight: bold;
    //         box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.16);

    //         &-back {
    //             padding: 0px;
    //             line-height: normal;
    //             min-height: unset;
    //             margin-right: 45px;
    //         }
    //     }
    //     &-items {
    //         flex: 1;
    //     }
    // }
    &__trigger {
        z-index: 10;
        position: absolute;
        bottom: 0px;
        left: 0px;
        color: white;
        font-size: 40px;
        padding: 30px 20px;
        text-align: center;
        background-color: var(--el-color-primary);

        &:hover {
            background-color: var(--el-color-primary-light-3);
        }
        &:active {
            background-color: var(--el-color-primary-dark);
        }
    }
}
</style>
