<template>
    <div ref="refDiv" class="parts-menu">
        <div class="parts-menu__left">
            <div class="parts-menu__left-header">{{ typeText }}</div>
            <el-row class="parts-menu__left-items" :gutter="20">
                <el-col v-for="cat in cats" :key="cat.id" :span="12" style="padding: 10px">
                    <part-cat-card :cat="cat" :active="selectedCat == cat.id" @select="onCatSelect"></part-cat-card>
                </el-col>
            </el-row>
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
        PartCatCard,
    },
    setup(props, ctx) {
        const refDiv = ref<HTMLDivElement>();
        const cats = ref<PartCategory[]>([]);
        const catMeta = ref<PartCategoryMeta>();
        apiProvider.requestPartCategories().then((res) => {
            if (res.ok) {
                cats.value = res.data || [];
            }
        });
        const typeText = computed(() => (props.type === "in" ? "内配" : "外配"));

        const selectedCat = ref("");
        return {
            typeText,
            cats,
            catMeta,
            refDiv,
            selectedCat,
            gotoLeft() {
                refDiv.value?.scrollBy({
                    behavior: "smooth",
                    left: -328,
                });
            },
            onCatSelect(cat: PartCategory) {
                selectedCat.value = cat.id.toString();
                apiProvider.requestPartCatMeta(cat.id).then((res) => {
                    if (res.ok) {
                        catMeta.value = res.data;
                        refDiv.value?.scrollBy({
                            behavior: "smooth",
                            left: 328,
                        });
                    }
                });
            },
        };
    },
});
</script>

<style scoped lang="scss">
$menu-width: 328px;
$header-height: 56px;
.parts-menu {
    border-radius: 10px 0px 0px 10px;
    box-shadow: -5px 4px 8px rgba(0, 0, 0, 0.07);
    background-color: var(--el-color-bg);
    width: $menu-width;
    max-width: $menu-width;
    overflow: hidden;

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
        &-items {
            flex: 1;
            white-space: pre-wrap;
            margin-left: 0px !important;
            margin-right: 0px !important;
            padding: 10px !important;
            overflow-y: auto;

            // & .item {
            //     display: inline-flex;
            //     justify-content: center;
            //     align-items: center;
            //     width: 50px;
            //     height: 50px;
            //     border: 1px solid red;
            //     margin: 10px;
            // }
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
