<template>
    <div ref="refDiv" class="parts-menu">
        <div v-show="opened" class="parts-menu__left" :class="{ 'is-level-up': !!tabStack.length }">
            <div class="parts-menu__left-header">
                <div>
                    <el-button type="primary" plain @click="$emit('action', 'manifest')">清单</el-button>
                    <el-button type="primary" plain @click="$emit('action', 'offer')">报价</el-button>
                    <el-button type="primary" plain @click="$emit('action', 'complete')">完成</el-button>
                </div>
            </div>
            <i
                v-if="!!tabStack.length"
                class="parts-menu__left-levelup iconfont icon-level-up"
                @click="onUpLevelClick"
            ></i>
            <el-tabs
                v-show="!slideLeft"
                v-model="selectedTabName"
                class="parts-menu__left-cats"
                tab-position="left"
                @tab-click="onCatChange"
            >
                <el-tab-pane v-for="(tab, index) in activeTabs" :key="tab.name" :label="tab.label" :name="tab.name">
                    <template v-if="index === 0 && type === 'out'" #label>
                        <div class="parts-menu__tab-bgLabel">{{ tab.label }}</div>
                    </template>
                    <component
                        :is="tab.component"
                        :up="!!tabStack.length"
                        v-bind="tab.bind"
                        v-on="tab.on"
                        :active="selectedTabName === tab.name"
                    />
                </el-tab-pane>
            </el-tabs>
        </div>
        <div v-show="opened" class="parts-menu__right" :class="{ 'slide-to-left': slideLeft }">
            <div class="parts-menu__right-header">
                <el-button
                    class="parts-menu__right-header-back"
                    icon="el-icon-arrow-left"
                    type="text"
                    @click="slide('right')"
                    >返回</el-button
                >
                <span class="parts-menu__right-header-title"> 明细清单 </span>
                <i style="flex: 1"></i>
                <!-- <el-button type="text" size="mini" icon="el-icon-printer">打印清单</el-button> -->
            </div>
            <div v-if="schemeManifest" class="parts-menu__right-manifest">
                <manifest-list :list="schemeManifest" />
            </div>
            <!-- <div v-if="schemeManifest" class="parts-menu__right-price">
                <span class="price__label">合计：</span>
                <span class="price__symbol"> ￥ </span>
                <span class="price__offer">{{ offerPrice.integer }}</span>
                <span class="price__symbol">.{{ offerPrice.decimal }} </span>
            </div> -->
        </div>
        <i
            class="collapse-trigger"
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
import { computed, defineComponent, PropType, provide, ref, watch } from "vue";
import { useStore } from "vuex";
import { StateType } from "@/store";
import {
    BackgroundType,
    findSiblingCats,
    Part,
    PartCategory,
    PartCategoryMeta,
    ProductCategory,
    SchemeManifest,
} from "@/api/interface/provider.interface";
import apiProvider from "@/api/provider";
import { PartCount } from "@/lib/scheme";
import CatTab from "./CatTab.vue";
import PartBgTab from "./PartBgTab.vue";
import CatsList from "./CatsList.vue";
import type { ImgCardItemType } from "./ImgCardItem.vue";
import ManifestList from "./ManifestList.vue";

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
        ManifestList,
    },
    emits: ["update:opened", "part", "action", "bg"],
    setup(props, ctx) {
        const store = useStore<StateType>();
        const refDiv = ref<HTMLDivElement>();
        const cats = ref<PartCategory[]>([]);
        const catMeta = ref<PartCategoryMeta>();
        const selectedTabName = ref<string>();
        const schemeManifest = ref<SchemeManifest>();
        const slideLeft = ref(false);
        apiProvider.requestPartCategories().then((res) => {
            if (res.ok) {
                cats.value = res.data || [];
            }
        });
        const typeText = computed(() => (props.type === "in" ? "内配" : "外观"));
        const inCats = computed<PartCategory[]>(() => {
            if (!store.state.globalCfg) {
                return [];
            }
            return cats.value.filter((c) => store.state.globalCfg?.partsCatInterior.includes(c.id));
        });
        const outCats = computed<PartCategory[]>(() => {
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
                if (props.type === "in") {
                    selectedTabName.value = topLevelTabs.value[0].name;
                } else {
                    selectedTabName.value = topLevelTabs.value[1].name;
                }
            },
        );

        const bgTab: TabType = {
            name: "bg",
            label: "背景",
            component: "PartBgTab",
            bind: {},
            on: {
                bg(bg: ImgCardItemType, bgType: BackgroundType) {
                    ctx.emit("bg", bg, bgType);
                },
            },
        };

        function onUpLevelClick() {
            tabStack.value.pop();
            const tabs = tabStack.value[tabStack.value.length - 1] || topLevelTabs.value;
            // if (tabs.length >= 2) {
            //     selectedTabName.value = tabs[1].name;
            // } else {
            //     selectedTabName.value = "bg";
            // }

            if (props.type === "in") {
                selectedTabName.value = tabs[0].name;
            } else if (tabs.length >= 2) {
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
            if (props.type === "in") {
                tabStack.value.push(tabs);
            } else {
                tabStack.value.push([bgTab, ...tabs]);
            }
        }

        const topLevelTabs = computed<TabType[]>(() => {
            const partsTabs = cats2Tabs(activeCats.value);
            if (props.type === "in") {
                return partsTabs;
            }
            return [bgTab, ...partsTabs];
        });

        const activeTabs = computed(() => {
            const len = tabStack.value.length;
            return tabStack.value[len - 1] || topLevelTabs.value;
        });

        const selectedPartId = ref(0);
        const selectedCatId = ref(0);

        provide("selectedPartId", selectedPartId);

        function slide(direction: "left" | "right") {
            // refDiv.value?.scrollTo({
            //     behavior: "smooth",
            //     top: 0,
            //     left: direction === "left" ? 428 : 0,
            // });
            slideLeft.value = direction === "left" ? true : false;
        }

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
            schemeManifest,
            slideLeft,
            slide,
            onCatChange(tab: any) {
                console.log("tab", tab.instance);

                // const catId = tab.props.name;
                // selectedCatId.value = catId;
                // requestPartCatMeta();
            },
            onUpLevelClick,
            selectPart(catId: string | number, partId: string | number) {
                slide("right");
                selectedPartId.value = +partId;
                for (const tab of activeTabs.value) {
                    if (tab.cat && tab.cat.id == catId) {
                        selectedTabName.value = catId.toString();
                        return;
                    }
                }
                // 清空堆栈
                tabStack.value.length = 0;

                const siblings = findSiblingCats(catId, activeCats.value);
                if (siblings) {
                    const tabs = cats2Tabs(siblings);
                    // const activeTab = tabs.find((t) => t.cat.id.toString() === catId.toString());
                    // selectedTabName.value = activeTab.name;
                    selectedTabName.value = catId.toString();
                    if (props.type === "out") {
                        tabs.unshift(bgTab);
                    }
                    tabStack.value.push(tabs);

                    selectedCatId.value = +catId;
                }
            },
            unselectPart(_catId: string | number, _partId: string | number) {
                selectedPartId.value = 0;
                selectedCatId.value = 0;
            },
            showManifest(parts: PartCount[]) {
                slide("left");
                const partIds = parts.filter((p) => p.count > 0).map((p) => p.partId);
                return apiProvider.requestSchemeManifestV2(partIds).then((res) => {
                    if (res.ok && res.data) {
                        schemeManifest.value = res.data || [];
                        for (const item of schemeManifest.value) {
                            item.count = parts.find((p) => p.partId === item.partid)?.count || 0;
                        }
                    }
                });
            },
            // showManifest(shcemeId: number | string, offer: boolean) {
            //     slide("left");
            //     return apiProvider.requestSchemeManifest(shcemeId).then((res) => {
            //         if (res.ok && res.data) {
            //             schemeManifest.value = res.data;
            //         }
            //     });
            // },
            // offerPrice: computed(() => {
            //     if (!schemeManifest.value) {
            //         return {
            //             integer: "",
            //             decimal: "",
            //         };
            //     } else {
            //         return splitPrice(+schemeManifest.value.offer);
            //     }
            // }),
        };
    },
});
</script>

<style scoped lang="scss">
$header-height: 56px;
// $menu-width: 20%;

.parts-menu {
    position: relative;
    box-shadow: 0px 10px 18px rgba(0, 0, 0, 0.07);
    background-color: var(--el-color-bg);
    // width: $menu-width;
    overflow: hidden;
    white-space: nowrap;
    &__left {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        overflow: hidden;
        width: 100%;
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

        &-levelup {
            cursor: pointer;
            position: absolute;
            left: 20px;
            top: $header-height + 10px;
            color: var(--el-color-black);
            font-size: 30px;
            z-index: 100;
            &:hover {
                color: var(--el-color-primary);
            }
        }
        &.is-level-up {
            :deep(.el-tabs__header) {
                padding-top: 40px;
            }
        }
        &-cats {
            flex: 1;
            white-space: pre-wrap;
            margin-left: 0px !important;
            margin-right: 0px !important;
            padding: 10px 0px 0px !important;
            overflow-y: auto;
            :deep(.el-tabs__item) {
                // color: var(--el-color-black);
                font-size: 15px;
                // line-height: 30px;
                // height: 30px;
                &.is-active {
                    font-weight: bold;
                }
            }
            :deep(.el-tabs__content) {
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
                width: 82px;
            }
            :deep(.el-tabs__nav-wrap::after) {
                width: 5px !important;
                left: 0px !important;
                background-color: var(--el-color-info);
            }
        }
    }
    &__tab-bgLabel {
        // border-bottom: 2px solid gray;
        // line-height: 30px;
        margin: 0 -20px;
        padding-right: 20px;
        background-color: #dbdbdbff;
        // background-color: var(--el-color-primary-light-5);
    }
    &__right {
        display: inline-flex;
        flex-direction: column;
        overflow: hidden;
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
        background-color: white;
        z-index: 100;
        &.slide-to-left {
            transform: translateX(-100%);
        }
        &-header {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0px 10px;
            height: $header-height;
            box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.16);
            &-title {
                color: var(--el-color-black);
                font-size: 26px;
                font-weight: bold;
                flex: 2;
                text-align: center;
            }
            &-back {
                padding: 0px;
                line-height: normal;
                min-height: unset;
                flex: 1;
            }
        }
        &-manifest {
            flex: 1;
            overflow-y: auto;
            padding: 0px 30px;
            margin-bottom: 70px;
        }
    }
}
</style>
