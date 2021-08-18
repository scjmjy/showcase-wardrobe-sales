<template>
    <div ref="refDiv" class="parts-menu">
        <div class="parts-menu__left">
            <div class="parts-menu__left-header">清单 | 报价 | 保存</div>
            <!-- <el-row class="parts-menu__left-items" :gutter="20">
                <el-col v-for="cat in cats" :key="cat.id" :span="12" style="padding: 10px">
                    <part-cat-card :cat="cat" :active="selectedCatId == cat.id" @select="onCatSelect"></part-cat-card>
                </el-col>
            </el-row> -->

            <el-tabs v-model="selectedCatId" class="parts-menu__left-cats" tab-position="left" @tab-click="onCatChange">
                <el-tab-pane v-for="cat in cats" :key="cat.id" :label="cat.name" :name="cat.id.toString()">
                    <cat-tab :active="selectedCatId === cat.id.toString()" :cat="cat" />
                    <!-- <cat-tab v-if="selectedCatId == cat.id" :cat="cat" /> -->
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="parts-menu__right">
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
        </div>
    </div>
</template>

<script lang="ts">
import { PartCategory, PartCategoryMeta } from "@/api/interface/provider.interface";
import { computed, defineComponent, PropType, ref } from "vue";
import apiProvider from "@/api/provider";
import PartCatCard from "./PartCatCard.vue";
import CatTab from "./CatTab.vue";
import { ElTabPane } from "element-plus";

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
    },
    components: {
        CatTab,
        // PartCatCard,
    },
    setup(props, ctx) {
        const refDiv = ref<HTMLDivElement>();
        const cats = ref<PartCategory[]>([]);
        const catMeta = ref<PartCategoryMeta>();
        const selectedCatId = ref("");
        apiProvider.requestPartCategories().then((res) => {
            if (res.ok) {
                cats.value = res.data || [];
                if (cats.value.length) {
                    selectedCatId.value = cats.value[0].id.toString();
                }
            }
        });
        const typeText = computed(() => (props.type === "in" ? "内配" : "外配"));

        // function requestPartCatMeta() {
        //     apiProvider.requestPartCatMeta(selectedCatId.value).then((res) => {
        //         if (res.ok) {
        //             catMeta.value = res.data;
        //             // refDiv.value?.scrollBy({
        //             //     behavior: "smooth",
        //             //     left: 328,
        //             // });
        //         }
        //     });
        // }
        return {
            typeText,
            cats,
            catMeta,
            refDiv,
            selectedCatId,
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
        };
    },
});
</script>

<style scoped lang="scss">
$menu-width: 428px;
$header-height: 56px;
.parts-menu {
    border-radius: 10px;
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
        &-header {
            display: flex;
            align-items: flex-end;
            padding-left: 23px;
            padding-bottom: 10px;
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
                min-height: 40px;
            }
        }
    }
    &__right {
        display: inline-flex;
        flex-direction: column;
        overflow: hidden;
        width: $menu-width;
        height: 100%;
        &-header {
            display: flex;
            align-items: flex-end;
            padding-left: 10px;
            padding-bottom: 10px;
            height: $header-height;
            color: var(--el-color-black);
            font-size: 26px;
            font-weight: bold;
            box-shadow: 0 0 10px 0px rgba(0, 0, 0, 0.16);

            &-back {
                padding: 0px;
                line-height: normal;
                min-height: unset;
                margin-right: 45px;
            }
        }
        &-items {
            flex: 1;
        }
    }
}
</style>
