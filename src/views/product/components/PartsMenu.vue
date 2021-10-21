<template>
    <div class="parts-menu">
        <div v-show="opened" class="parts-menu__left" :class="{ 'is-level-up': !!tabStack.length }">
            <i
                v-if="!!tabStack.length && !slideLeft"
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
                    <div class="parts-menu__left-cats-header">
                        <el-button
                            class="button-shadow"
                            type="black"
                            icon="el-iconfont icon-manifest"
                            size="small"
                            @click="$emit('action', 'manifest')"
                            >清单</el-button
                        >
                        <el-button
                            class="button-shadow"
                            type="success"
                            round
                            size="small"
                            :disabled="false"
                            @click="$emit('action', 'complete')"
                            >完成
                            <i class="el-icon-right"></i>
                        </el-button>
                    </div>
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
                    @click="onClickBack"
                ></el-button>
                <span class="parts-menu__right-header-title"> 明细清单 </span>
                <el-button
                    class="parts-menu__right-header-offer button-shadow"
                    icon="el-iconfont icon-offer"
                    type="success"
                    size="small"
                    round
                    @click="$emit('action', 'offer')"
                    >报价</el-button
                >
            </div>
            <div
                v-if="schemeManifest"
                class="parts-menu__right-manifest"
                :class="{ 'is-blur': selectedAttachmentItem }"
            >
                <manifest-list
                    :list="schemeManifest"
                    :selectedItem="selectedAttachmentItem"
                    @select="onAttachmentItemSelect"
                />
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

        <transition name="el-zoom-in-bottom">
            <attachment-popup
                v-if="selectedAttachmentItem"
                class="parts-menu__attachmenPopup"
                :item="selectedAttachmentItem"
                @change="onAttachmentChange"
                @hide="onAttachmentPopupHide"
            ></attachment-popup>
        </transition>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, provide, ref, watch } from "vue";
import { useStore } from "vuex";
import { StateType } from "@/store";
import {
    BackgroundType,
    findSiblingCats,
    ManifestPart,
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
import AttachmentPopup from "./AttachmentPopup.vue";

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
        opened: {
            type: Boolean,
            default: false,
        },
        completeDisabled: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        CatTab,
        PartBgTab,
        CatsList,
        ManifestList,
        AttachmentPopup,
    },
    emits: ["update:opened", "part", "action", "bg", "attachment-replacement"],
    setup(props, ctx) {
        const store = useStore<StateType>();
        const cats = computed<PartCategory[]>(() => store.getters.partCats);
        const catMeta = ref<PartCategoryMeta>();
        const selectedTabName = ref<string>();
        const selectedAttachmentItem = ref<ManifestPart>();
        const schemeManifest = ref<SchemeManifest>();
        const slideLeft = ref(false);
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
        watch(
            () => topLevelTabs.value,
            (tabs) => {
                tabStack.value.length = 0;
                if (props.type === "in") {
                    selectedTabName.value = tabs[0].name;
                } else {
                    selectedTabName.value = tabs[1].name;
                }
            },
            {
                immediate: true,
            },
        );

        const activeTabs = computed(() => {
            const len = tabStack.value.length;
            return tabStack.value[len - 1] || topLevelTabs.value;
        });

        const selectedPartId = ref(0);
        const selectedCatId = ref(0);

        provide("selectedPartId", selectedPartId);

        function slide(direction: "left" | "right") {
            slideLeft.value = direction === "left" ? true : false;
        }

        return {
            cats,
            activeCats,
            activeTabs,
            topLevelTabs,
            tabStack,
            catMeta,
            selectedTabName,
            selectedAttachmentItem,
            schemeManifest,
            slideLeft,
            slide,
            onClickBack() {
                slide("right");
                selectedAttachmentItem.value = undefined;
            },
            onCatChange(_tab: any) {
                // console.log("tab", tab.instance);
                // const catId = tab.props.name;
                // selectedCatId.value = catId;
                // requestPartCatMeta();
            },
            onUpLevelClick,
            onAttachmentItemSelect(item: ManifestPart) {
                selectedAttachmentItem.value = item;
            },
            onAttachmentChange(part: Part, _cat: PartCategory) {
                if (selectedAttachmentItem.value) {
                    const oldAttachment = Object.assign({}, selectedAttachmentItem.value);
                    const newAttachment = Object.assign({}, oldAttachment, {
                        pname: part.name,
                        pic: part.pic,
                        partid: +part.id,
                    });
                    ctx.emit("attachment-replacement", newAttachment, oldAttachment);

                    Object.assign(selectedAttachmentItem.value, newAttachment);

                    selectedAttachmentItem.value = undefined;
                }
            },
            onAttachmentPopupHide() {
                selectedAttachmentItem.value = undefined;
            },
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
                            const found = parts.find((p) => p.partId === item.partid);
                            if (found) {
                                item.count = found.count;
                                item.catid = found.catId;
                            }
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

.parts-menu {
    position: relative;
    box-shadow: 0px 10px 18px rgba(0, 0, 0, 0.07);
    background-color: white;
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

        &-levelup {
            cursor: pointer;
            position: absolute;
            left: 20px;
            top: 5px;
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
                padding-top: $header-height;
            }
        }
        &-cats {
            flex: 1;
            white-space: pre-wrap;
            margin-left: 0px !important;
            margin-right: 0px !important;
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
            :deep(.el-tabs__header) {
                // margin-right: 0px;
                padding-top: 5px;
                background-color: var(--el-color-bg);
                transition: padding 0.3s ease;
            }
            :deep(.el-tabs__content) {
                padding-right: 3px;
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
            &-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: $header-height;
                padding: 5px 0px 8px 0px;
                margin-bottom: 5px;
                border-bottom: 1px solid var(--el-color-info);
                :deep(.el-button) {
                    width: 50%;
                    height: 100%;
                    font-weight: bold;
                    padding-left: 5px;
                    padding-right: 5px;
                    &.is-disabled {
                        background-color: var(--el-color-info);
                    }
                }
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
            justify-content: space-between;
            align-items: center;
            padding: 0px 10px 0px 10px;
            height: $header-height;
            box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.16);
            &-title {
                padding-left: 8px;
                color: var(--el-color-black);
                font-size: 26px;
                // font-weight: bold;
                flex: 2;
                text-align: center;
            }
            &-offer {
                // height: 100%;
            }
            &-back {
                padding-left: 5px;
                line-height: normal;
                min-height: unset;
                color: var(--el-color-black);
            }
        }
        &-manifest {
            flex: 1;
            overflow-y: auto;
            padding: 0px 30px;
            margin-bottom: 70px;

            &.is-blur {
                filter: blur(2px);
            }
        }
    }
    &__attachmenPopup {
        top: $header-height;
    }
}
</style>
